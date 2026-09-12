package com.joi.android.data

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

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
    fun observeByUserId(userId: String): LiveData<JoiMemoryRecordEntity?>

    @Query("SELECT * FROM joi_memory_records WHERE userId = :userId LIMIT 1")
    fun findByUserId(userId: String): JoiMemoryRecordEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsert(record: JoiMemoryRecordEntity)

    @Query("DELETE FROM joi_memory_records WHERE userId = :userId")
    fun deleteByUserId(userId: String)
}

@Entity(tableName = "joi_initiative_records")
data class JoiInitiativeRecordEntity(
    @PrimaryKey val userId: String,
    val payloadBase64: String,
    val ivBase64: String
)

@Dao
interface JoiInitiativeRecordDao {
    @Query("SELECT * FROM joi_initiative_records WHERE userId = :userId LIMIT 1")
    fun findByUserId(userId: String): JoiInitiativeRecordEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsert(record: JoiInitiativeRecordEntity)
}

@Database(entities = [JoiMemoryRecordEntity::class, JoiInitiativeRecordEntity::class], version = 2, exportSchema = false)
abstract class JoiMemoryDatabase : RoomDatabase() {
    abstract fun memoryDao(): JoiMemoryRecordDao
    abstract fun initiativeDao(): JoiInitiativeRecordDao

    companion object {
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "CREATE TABLE IF NOT EXISTS joi_initiative_records " +
                        "(userId TEXT NOT NULL PRIMARY KEY, payloadBase64 TEXT NOT NULL, ivBase64 TEXT NOT NULL)"
                )
            }
        }

        @Volatile
        private var instance: JoiMemoryDatabase? = null

        fun getInstance(context: Context): JoiMemoryDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context,
                    JoiMemoryDatabase::class.java,
                    "joi_memory.db"
                )
                    .addMigrations(MIGRATION_1_2)
                    .allowMainThreadQueries()
                    .build()
                    .also { instance = it }
            }
        }
    }
}
