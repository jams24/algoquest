package com.algoquest.di

import android.content.Context
import androidx.room.Room
import com.algoquest.rimola.BuildConfig
import com.algoquest.data.local.AlgoDatabase
import com.algoquest.data.local.ProblemDao
import com.algoquest.data.local.TopicDao
import com.algoquest.data.remote.ApiService
import com.algoquest.data.remote.AuthInterceptor
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(@ApplicationContext context: Context): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(context))
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AlgoDatabase {
        return Room.databaseBuilder(context, AlgoDatabase::class.java, "algoquest_cache")
            .fallbackToDestructiveMigration(true)
            .build()
    }

    @Provides
    fun provideTopicDao(db: AlgoDatabase): TopicDao = db.topicDao()

    @Provides
    fun provideProblemDao(db: AlgoDatabase): ProblemDao = db.problemDao()
}
