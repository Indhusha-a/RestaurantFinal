package com.restaurant.demo.Service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void alignNotificationSchema() {
        if (!tableExists("notifications")) {
            return;
        }

        dropLegacyUserIdColumn();
        ensureIndex("idx_notifications_recipient", "recipient_id, recipient_type");
        ensureIndex("idx_notifications_unread", "recipient_id, recipient_type, is_read");
    }

    private void dropLegacyUserIdColumn() {
        if (!columnExists("notifications", "user_id")) {
            return;
        }

        jdbcTemplate.queryForList(
                """
                SELECT constraint_name
                FROM information_schema.key_column_usage
                WHERE table_schema = DATABASE()
                  AND table_name = 'notifications'
                  AND column_name = 'user_id'
                  AND referenced_table_name IS NOT NULL
                """,
                String.class
        ).forEach(constraintName ->
                jdbcTemplate.execute("ALTER TABLE notifications DROP FOREIGN KEY " + constraintName)
        );

        jdbcTemplate.execute("ALTER TABLE notifications DROP COLUMN user_id");
    }

    private void ensureIndex(String indexName, String columns) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                  AND table_name = 'notifications'
                  AND index_name = ?
                """,
                Integer.class,
                indexName
        );

        if (count != null && count == 0) {
            jdbcTemplate.execute("CREATE INDEX " + indexName + " ON notifications (" + columns + ")");
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                """,
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND column_name = ?
                """,
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }
}
