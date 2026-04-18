package com.algoquest

import android.app.Application
import com.revenuecat.purchases.LogLevel
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class AlgoQuestApp : Application() {

    companion object {
        // TODO: Replace with your AlgoQuest RevenueCat API key
        const val REVENUECAT_API_KEY = "REPLACE_WITH_YOUR_ALGOQUEST_API_KEY"
    }

    override fun onCreate() {
        super.onCreate()

        // Only configure if key is set
        if (REVENUECAT_API_KEY != "REPLACE_WITH_YOUR_ALGOQUEST_API_KEY") {
            Purchases.logLevel = LogLevel.DEBUG
            Purchases.configure(
                PurchasesConfiguration.Builder(this, REVENUECAT_API_KEY)
                    .build()
            )
        }
    }
}
