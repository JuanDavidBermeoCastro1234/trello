# 🗂 Mini Trello - Spring Boot

Aplicación sencilla tipo tablero Kanban (Trello) desarrollada con **Spring Boot + MySQL + JavaScript**.  
Permite crear tareas y moverlas entre columnas.  
Cuando se mueve una tarjeta, su estado se actualiza automáticamente en la base de datos.

---

## 🚀 Tecnologías
- Java 17
- Spring Boot
- Spring Data JPA (Hibernate)
- MySQL
- HTML, CSS, JavaScript (Drag & Drop)

---

## 🧱 Arquitectura

```
com.ejemplo.trello
│
├── controller   → Maneja las rutas HTTP
├── service      → Lógica de negocio
├── repository   → Acceso a la base de datos
├── model        → Entidad Task (tabla)
└── TrelloApplication.java → Punto de inicio
```

---

## 🗄 Base de Datos

Crear base en MySQL:

```sql
CREATE DATABASE trello_db;
```

Configurar en `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/trello_db
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

---

## 📌 Endpoints

- `GET /api/tasks` → Lista todas las tareas  
- `POST /api/tasks` → Crea una tarea  
- `PUT /api/tasks/{id}` → Actualiza el estado (mover tarjeta)

Ejemplo para crear tarea:

```json
{
  "title": "Nueva tarea",
  "description": "Ejemplo",
  "status": "BACKLOG"
}
```

---

## 🔄 Cómo Funciona

1. El frontend carga las tareas con `GET /api/tasks`.
2. Se renderizan en su columna según el `status`.
3. Al mover una tarjeta (drag & drop), se envía un `PUT`.
4. Spring Boot actualiza el registro en MySQL.
5. Al recargar, la tarea aparece en su nueva columna.

---

## ▶️ Ejecutar

```bash
mvn spring-boot:run
```

Abrir en navegador:

```
http://localhost:8080
```

---

Proyecto práctico para integrar **Frontend JS + Backend Spring Boot + MySQL** con arquitectura en capas.