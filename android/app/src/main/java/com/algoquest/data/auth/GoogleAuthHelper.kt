package com.algoquest.data.auth

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.algoquest.BuildConfig
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GoogleAuthHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val credentialManager = CredentialManager.create(context)

    suspend fun signIn(activityContext: Context): Result<String> {
        return try {
            val activity = activityContext.findActivity()
            if (activity == null) {
                Log.e("GoogleAuth", "Could not find Activity from context: ${activityContext.javaClass.name}")
                return Result.failure(Exception("Could not find Activity context"))
            }

            Log.d("GoogleAuth", "Starting Google Sign-In with client ID: ${BuildConfig.GOOGLE_WEB_CLIENT_ID}")

            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(BuildConfig.GOOGLE_WEB_CLIENT_ID)
                .setAutoSelectEnabled(false)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            Log.d("GoogleAuth", "Calling credentialManager.getCredential...")

            val result = credentialManager.getCredential(
                context = activity,
                request = request
            )

            Log.d("GoogleAuth", "Got credential result, type: ${result.credential.type}")

            val credential = result.credential
            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
            val idToken = googleIdTokenCredential.idToken

            Log.d("GoogleAuth", "Successfully got ID token")
            Result.success(idToken)
        } catch (e: GetCredentialCancellationException) {
            Log.w("GoogleAuth", "Sign-in cancelled by user")
            Result.failure(Exception("Sign-in cancelled"))
        } catch (e: NoCredentialException) {
            Log.e("GoogleAuth", "No credentials available: ${e.message}")
            Result.failure(Exception("No Google accounts found. Please add a Google account to your device."))
        } catch (e: GetCredentialException) {
            Log.e("GoogleAuth", "GetCredentialException: type=${e.type}, message=${e.message}", e)
            Result.failure(Exception("Google sign-in error: ${e.message}"))
        } catch (e: Exception) {
            Log.e("GoogleAuth", "Unexpected error: ${e.javaClass.name}: ${e.message}", e)
            Result.failure(Exception("Google sign-in failed: ${e.message}"))
        }
    }
}

private fun Context.findActivity(): Activity? {
    var ctx = this
    while (ctx is ContextWrapper) {
        if (ctx is Activity) return ctx
        ctx = ctx.baseContext
    }
    return null
}
