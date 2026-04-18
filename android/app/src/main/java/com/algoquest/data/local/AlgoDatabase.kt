package com.algoquest.data.local

import androidx.room.*

@Entity(tableName = "cached_topics")
data class CachedTopic(
    @PrimaryKey val id: String,
    val name: String,
    val slug: String,
    val description: String,
    val icon: String,
    val color: String,
    val order: Int,
    val totalProblems: Int,
    val completedProblems: Int,
    val isUnlocked: Boolean,
    val lastUpdated: Long = System.currentTimeMillis()
)

@Entity(tableName = "cached_problems")
data class CachedProblem(
    @PrimaryKey val slug: String,
    val jsonData: String,  // Full problem JSON serialized
    val lastUpdated: Long = System.currentTimeMillis()
)

@Dao
interface TopicDao {
    @Query("SELECT * FROM cached_topics ORDER BY `order` ASC")
    suspend fun getAllTopics(): List<CachedTopic>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(topics: List<CachedTopic>)

    @Query("DELETE FROM cached_topics")
    suspend fun clearAll()
}

@Dao
interface ProblemDao {
    @Query("SELECT * FROM cached_problems WHERE slug = :slug")
    suspend fun getProblem(slug: String): CachedProblem?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(problem: CachedProblem)

    @Query("DELETE FROM cached_problems")
    suspend fun clearAll()
}

@Database(
    entities = [CachedTopic::class, CachedProblem::class],
    version = 1,
    exportSchema = false
)
abstract class AlgoDatabase : RoomDatabase() {
    abstract fun topicDao(): TopicDao
    abstract fun problemDao(): ProblemDao
}
