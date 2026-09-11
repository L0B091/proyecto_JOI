package com.joi.android.data

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase

@Entity(tableName = "joi_memory_records")
data class JoiMemoryRecordEntity(
    @PrimaryKey val userId: String,
    val payloadBase64: String,
    val ivBase64: String,
    val schemaVersion: Int,
    val updatedAt: Long
)

@Dao
interface JoiMemoryRecordDao {
    @Query("SELECT * FROM joi_memory_records WHERE userId = :userId LIMIT 1")
    fun findByUserId(userId: String): JoiMemoryRecordEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsert(record: JoiMemoryRecordEntity)

    @Query("DELETE FROM joi_memory_records WHERE userId = :userId")
    fun deleteByUserId(userId: String)
}

@Database(entities = [JoiMemoryRecordEntity::class], version = 1, exportSchema = false)
abstract class JoiMemoryDatabase : RoomDatabase() {
    abstract fun memoryDao(): JoiMemoryRecordDao

    companion object {
        @Volatile
        private var instance: JoiMemoryDatabase? = null

        fun getInstance(context: Context): JoiMemoryDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context,
                    JoiMemoryDatabase::class.java,
                    "joi_memory.db"
                )
                    .allowMainThreadQueries()
                    .build()
                    .also { instance = it }
            }
        }
    }
}
