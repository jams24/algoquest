# AlgoQuest ProGuard Rules

# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * { @retrofit2.http.* <methods>; }

# Gson
-keep class com.algoquest.data.model.** { *; }
-keepclassmembers class * { @com.google.gson.annotations.SerializedName <fields>; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# RevenueCat
-keep class com.revenuecat.purchases.** { *; }

# Google Credentials
-keep class com.google.android.libraries.identity.googleid.** { *; }
-keep class androidx.credentials.** { *; }

# Hilt
-keep class dagger.hilt.** { *; }

# Compose - keep runtime
-dontwarn androidx.compose.**
