# 🚀 Template Engines Demo Project (Express, Node.js, MongoDB)

Цей проєкт демонструє використання **різних шаблонізаторів** — **Pug** та **EJS** — в одному Express-додатку.
Інтегрований із **MongoDB Atlas** через Mongoose, він реалізує повний цикл **автентифікації користувачів** (через Passport.js) і містить **розширені CRUD-операції** для API.

---

## 🛠️ Технологічний стек

* **Сервер:** Node.js, Express
* **База даних:** MongoDB Atlas (через Mongoose)
* **Шаблонізатори:** Pug, EJS
* **Автентифікація:** Passport.js (Local Strategy), bcryptjs

---

## ✨ Основний функціонал

### 1. Автентифікація користувачів

* **Реєстрація та вхід** — реалізовано повноцінну систему автентифікації.
* **Захищені маршрути** — middleware `isAuthenticated` обмежує доступ до CRUD.
* **Видалення користувача:**
  `POST /users/delete/:userId` → `User.findByIdAndDelete(userId)`

---

### 2. Керування статтями (Articles CRUD)

* **Додавання статей:** через форму (Pug).
* **Перегляд списку та деталей:** через шаблони EJS.

---

## 🔬 Розширений CRUD API для `TestItem` (`/db-ops`)

Усі маршрути CRUD реалізовані через **Mongoose** і **захищені автентифікацією**.
Колекція: `TestItem`

---

### 🧩 1. Створення (Create)

| Метод    | Маршрут               | Опис                                | Mongoose                     |
| :------- | :-------------------- | :---------------------------------- | :--------------------------- |
| **POST** | `/db-ops/insert-one`  | Додавання одного документа          | `new TestItem(data).save()`  |
| **POST** | `/db-ops/insert-many` | Пакетне додавання масиву документів | `TestItem.insertMany(items)` |

#### 📝 Приклад (POST `/db-ops/insert-one`)

**Тіло запиту:**

```json
{
  "name": "Test Item",
  "value": 42
}
```

**Відповідь (201 Created):**

```json
{
  "message": "insertOne: Документ успішно додано",
  "data": { "_id": "...", "name": "Test Item", "value": 42, "category": "Demo" }
}
```

---

### 🧩 2. Оновлення (Update)

| Метод   | Маршрут                   | Опис                                       | Mongoose                                      |
| :------ | :------------------------ | :----------------------------------------- | :-------------------------------------------- |
| **PUT** | `/db-ops/update-one/:id`  | Часткове оновлення одного документа ($set) | `TestItem.updateOne({_id: id}, {$set: data})` |
| **PUT** | `/db-ops/update-many`     | Масове оновлення документів за категорією  | `TestItem.updateMany(filter, {$set: data})`   |
| **PUT** | `/db-ops/replace-one/:id` | Повна заміна документа                     | `TestItem.replaceOne({_id: id}, newData)`     |

#### 📝 Приклад (PUT `/db-ops/update-one/{{id}}`)

**Тіло запиту:**

```json
{
  "value": 999
}
```

**Відповідь (200 OK):**

```json
{
  "message": "updateOne: Документ оновлено",
  "result": { "modifiedCount": 1, "matchedCount": 1 }
}
```

---

### 🧩 3. Видалення (Delete)

| Метод      | Маршрут                  | Опис                                      | Mongoose                        |
| :--------- | :----------------------- | :---------------------------------------- | :------------------------------ |
| **DELETE** | `/db-ops/delete-one/:id` | Видалення одного документа за ID          | `TestItem.deleteOne({_id: id})` |
| **DELETE** | `/db-ops/delete-many`    | Видалення багатьох документів за фільтром | `TestItem.deleteMany(filter)`   |

#### 📝 Приклад (DELETE `/db-ops/delete-many`)

**Тіло запиту:**

```json
{
  "category": "Batch"
}
```

**Відповідь (200 OK):**

```json
{
  "message": "deleteMany: Видалено N документів",
  "result": { "deletedCount": N }
}
```

---

### 🧩 4. Розширене читання (Read)

| Метод   | Маршрут                        | Опис                                                  | Mongoose                                           |
| :------ | :----------------------------- | :---------------------------------------------------- | :------------------------------------------------- |
| **GET** | `/db-ops/find-with-projection` | Вибірка документів з проекцією (лише `name`, `value`) | `TestItem.find({}, { name: 1, value: 1, _id: 0 })` |

#### 📝 Приклад (GET `/db-ops/find-with-projection`)

**Відповідь (200 OK):**

```json
{
  "message": "find (з проекцією): Успішно",
  "data": [
    { "name": "Item A", "value": 100 },
    { "name": "Item B", "value": 200 }
  ]
}
```

---

## ⚙️ Встановлення та запуск

### 📋 Передумови

* Node.js (v18+)
* Обліковий запис MongoDB Atlas (або локальний MongoDB)

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Запуск сервера

Перевірте, що змінна середовища `MONGO_URI` (або URI у `server.js`) вказує на вашу базу даних.

```bash
node server.js
```

> Сервер запущено на: **[http://localhost:3001](http://localhost:3001)**

### 3. Тестування API (Postman / Thunder Client)

1. **Вхід:**
   Виконайте `POST http://localhost:3001/login` (формат `x-www-form-urlencoded` з вашими обліковими даними).
   Отримайте **сесійну cookie**.

2. **CRUD-операції:**
   Використовуйте cookie для доступу до `/db-ops/*` маршрутів з відповідним JSON-тілом.

---

## 🧠 Автор

**Yurii Zvirianskyj**
Full Stack JS Developer
📦 GitHub: [yurii0210](https://github.com/yurii0210)
