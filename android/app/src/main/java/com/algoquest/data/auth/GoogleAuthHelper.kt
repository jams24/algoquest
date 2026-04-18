package com.algoquest.data.auth

import android.app.Activity
import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.NoCredentialException
import com.algoquest.rimola.BuildConfig
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.withTimeout
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.cancellation.CancellationException

@Singleton
class GoogleAuthHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val credentialManager = CredentialManager.create(context)

    suspend fun getGoogleIdToken(activityContext: Context): Result<String> {
        val activity = activityContext as? Activity
            ?: return Result.failure(Exception("Google Sign-In requires an Activity context"))

        // Try the full Sign In with Google dialog first (most reliable),
        // fall back to One Tap bottom sheet if that fails
        return try {
            signInWithGoogleButton(activity)
        } catch (e: CancellationException) {
            throw e
        } catch (e: GetCredentialCancellationException) {
            Log.d("GoogleAuth", "User cancelled")
            Result.failure(Exception("Sign-in cancelled"))
        } catch (e: Exception) {
            Log.w("GoogleAuth", "Sign In With Google failed: ${e.message}, trying One Tap fallback")
            try {
                oneTapSignIn(activity)
            } catch (e2: CancellationException) {
                throw e2
            } catch (e2: GetCredentialCancellationException) {
                Log.d("GoogleAuth", "User cancelled")
                Result.failure(Exception("Sign-in cancelled"))
            } catch (e2: NoCredentialException) {
                Log.e("GoogleAuth", "No credential available", e2)
                Result.failure(Exception("No Google account found. Please add a Google account in Settings."))
            } catch (e2: Exception) {
                Log.e("GoogleAuth", "Google sign-in failed: ${e2::class.simpleName}: ${e2.message}", e2)
                Result.failure(Exception("Google sign-in failed: ${e2.message}"))
            }
        }
    }

    /** Full Sign In with Google dialog — shows the standard Google Sign-In consent screen */
    private suspend fun signInWithGoogleButton(activity: Activity): Result<String> {
        val signInOption = GetSignInWithGoogleOption.Builder(BuildConfig.GOOGLE_WEB_CLIENT_ID)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(signInOption)
            .build()

        Log.d("GoogleAuth", "Trying Sign In With Google button flow")
        val result = withTimeout(30_000L) {
            credentialManager.getCredential(activity, request)
        }
        Log.d("GoogleAuth", "Got credential type: ${result.credential.type}")
        val credential = GoogleIdTokenCredential.createFrom(result.credential.data)
        return Result.success(credential.idToken)
    }

    /** One Tap bottom sheet — faster for returning users */
    private suspend fun oneTapSignIn(activity: Activity): Result<String> {
        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(BuildConfig.GOOGLE_WEB_CLIENT_ID)
            .setAutoSelectEnabled(false)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        Log.d("GoogleAuth", "Trying One Tap fallback")
        val result = withTimeout(15_000L) {
            credentialManager.getCredential(activity, request)
        }
        Log.d("GoogleAuth", "Got credential type: ${result.credential.type}")
        val credential = GoogleIdTokenCredential.createFrom(result.credential.data)
        return Result.success(credential.idToken)
    }
}
