package com.algoquest

import android.app.Application
import com.revenuecat.purchases.LogLevel
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class AlgoQuestApp : Application() {

    companion object {
        const val REVENUECAT_API_KEY = "test_MkYIbmzoRniGVnKrlHejhPntLuE"
        const val ENTITLEMENT_ID = "algoquest Pro"
    }

    override fun onCreate() {
        super.onCreate()
        Purchases.logLevel = LogLevel.DEBUG
        Purchases.configure(
            PurchasesConfiguration.Builder(this, REVENUECAT_API_KEY).build()
        )
    }
}
