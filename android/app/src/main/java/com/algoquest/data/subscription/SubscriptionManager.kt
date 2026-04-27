package com.algoquest.data.subscription

import android.util.Log
import com.algoquest.AlgoQuestApp
import com.algoquest.data.model.SyncSubscriptionRequest
import com.algoquest.data.remote.ApiService
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.awaitCustomerInfo
import com.revenuecat.purchases.awaitLogIn
import com.revenuecat.purchases.awaitLogOut
import com.revenuecat.purchases.awaitRestore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

data class SubscriptionState(
    val isPro: Boolean = false,
    val isTrialActive: Boolean = false,
    val activeSubscription: String? = null,
    val expirationDate: String? = null,
    val isLoading: Boolean = true
)

@Singleton
class SubscriptionManager @Inject constructor(
    private val api: ApiService
) {

    private val scope = CoroutineScope(Dispatchers.IO)
    private val _state = MutableStateFlow(SubscriptionState())
    val state = _state.asStateFlow()

    init { refreshSubscriptionStatus() }

    private fun purchasesOrNull(): Purchases? = try {
        Purchases.sharedInstance
    } catch (e: Exception) {
        null
    }

    fun refreshSubscriptionStatus() {
        val purchases = purchasesOrNull()
        if (purchases == null) {
            _state.value = SubscriptionState(isLoading = false)
            return
        }
        _state.value = _state.value.copy(isLoading = true)
        scope.launch {
            try {
                val info = purchases.awaitCustomerInfo()
                val newState = parseCustomerInfo(info)
                _state.value = newState
                syncToBackend(newState)
            } catch (e: Exception) {
                Log.w("SubscriptionManager", "refreshSubscriptionStatus failed: ${e.message}")
                _state.value = SubscriptionState(isLoading = false)
            }
        }
    }

    private fun parseCustomerInfo(info: CustomerInfo): SubscriptionState {
        val entitlement = info.entitlements.active[AlgoQuestApp.ENTITLEMENT_ID]
        val isPro = entitlement != null

        val activeSubscription = when {
            entitlement?.productIdentifier?.contains("lifetime") == true -> "lifetime"
            entitlement?.productIdentifier?.contains("yearly") == true -> "yearly"
            entitlement?.productIdentifier?.contains("monthly") == true -> "monthly"
            else -> null
        }

        return SubscriptionState(
            isPro = isPro,
            isTrialActive = entitlement?.periodType?.name == "TRIAL",
            activeSubscription = activeSubscription,
            expirationDate = entitlement?.expirationDate?.toString(),
            isLoading = false
        )
    }

    private suspend fun syncToBackend(state: SubscriptionState) {
        try {
            api.syncSubscription(
                SyncSubscriptionRequest(
                    isPro = state.isPro,
                    expirationDate = state.expirationDate,
                    productId = state.activeSubscription
                )
            )
        } catch (e: Exception) {
            // Non-fatal — backend will reconcile via webhook or next app open
            Log.w("SubscriptionManager", "syncToBackend failed: ${e.message}")
        }
    }

    fun loginUser(userId: String) {
        val purchases = purchasesOrNull() ?: return
        scope.launch {
            try {
                val result = purchases.awaitLogIn(userId)
                val newState = parseCustomerInfo(result.customerInfo)
                _state.value = newState
                syncToBackend(newState)
            } catch (e: Exception) {
                Log.w("SubscriptionManager", "loginUser failed: ${e.message}")
            }
        }
    }

    fun logoutUser() {
        val purchases = purchasesOrNull() ?: return
        scope.launch {
            try {
                val info = purchases.awaitLogOut()
                _state.value = parseCustomerInfo(info)
            } catch (e: Exception) { /* ignore */ }
        }
    }

    suspend fun restorePurchases(): CustomerInfo? {
        val purchases = purchasesOrNull() ?: return null
        return try {
            val info = purchases.awaitRestore()
            val newState = parseCustomerInfo(info)
            _state.value = newState
            syncToBackend(newState)
            info
        } catch (e: Exception) { null }
    }

    fun hasPro(): Boolean = _state.value.isPro
}
