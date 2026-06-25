package com.erp.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Integration test that loads the full Spring application context.
 * Uses an in-memory H2 database so no external PostgreSQL is required.
 */
@SpringBootTest
@TestPropertySource(properties = {
    // Override datasource to use H2 in-memory DB — avoids needing a running PostgreSQL
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BackendJavaApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts successfully
    }

}
