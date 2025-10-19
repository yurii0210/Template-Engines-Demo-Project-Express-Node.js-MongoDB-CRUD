🚀 Template Engines Demo Project (Express, Node.js, MongoDB + Mongoose)

Цей проєкт демонструє використання різних шаблонізаторів — Pug та EJS — в одному Express-додатку.
Інтегрований із MongoDB Atlas через Mongoose, реалізує автентифікацію користувачів (Passport.js + bcryptjs) та повний цикл CRUD з розширеними можливостями.

🛠️ Технологічний стек

Сервер: Node.js, Express

База даних: MongoDB Atlas (через Mongoose)

Шаблонізатори: Pug, EJS

Автентифікація: Passport.js (Local Strategy), bcryptjs

ORM/ODM: Mongoose

✨ Основний функціонал
1. Автентифікація користувачів

Реєстрація та вхід

Захищені маршрути (isAuthenticated) для CRUD

Видалення користувача: POST /users/delete/:userId → User.findByIdAndDelete(userId)

Хешування паролю: bcryptjs

Сесії: express-session + cookie

2. Керування статтями (Articles CRUD)

Додавання статей: через форму Pug (/articles/add)

Перегляд списку та деталей: через EJS (/articles, /articles/:id)

🔬 Розширений CRUD API для TestItem (/db-ops)

Колекція: TestItem
Усі маршрути реалізовані через Mongoose та захищені автентифікацією.

🧩 1. Створення (Create)
Метод	Маршрут	Опис	Mongoose
POST	/db-ops/insert-one	Додавання одного документа	new TestItem(data).save()
POST	/db-ops/insert-many	Пакетне додавання документів	TestItem.insertMany(items)
📝 Приклад

POST /db-ops/insert-one

{
  "name": "Test Item",
  "value": 42
}


Відповідь:

{
  "message": "insertOne: Документ успішно додано",
  "data": { "_id": "...", "name": "Test Item", "value": 42, "category": "Demo" }
}

🧩 2. Оновлення (Update)
Метод	Маршрут	Опис	Mongoose
PUT	/db-ops/update-one/:id	Часткове оновлення одного документа ($set)	TestItem.updateOne({_id: id}, {$set: data})
PUT	/db-ops/update-many	Масове оновлення документів за категорією	TestItem.updateMany(filter, {$set: data})
PUT	/db-ops/replace-one/:id	Повна заміна документа	TestItem.replaceOne({_id: id}, newData)
🧩 3. Видалення (Delete)
Метод	Маршрут	Опис	Mongoose
DELETE	/db-ops/delete-one/:id	Видалення одного документа за ID	TestItem.deleteOne({_id: id})
DELETE	/db-ops/delete-many	Видалення багатьох документів за категорією	TestItem.deleteMany(filter)
🧩 4. Розширене читання (Read)
Метод	Маршрут	Опис	Mongoose
GET	/db-ops/find-with-projection	Вибірка документів з проекцією (лише name, value)	TestItem.find({}, { name: 1, value: 1, _id: 0 })
🧩 5. Користувачі (Users)

Список користувачів: GET /users → User.find({})

Деталі користувача: GET /users/:userId → User.findById(userId)

Редагування: POST /users/edit/:userId → User.findByIdAndUpdate(...)

Агрегації: /users/average-age → User.aggregate(...)

Курсор: /users-cursor → User.find().cursor()

🧩 6. Assignments (приклад навчальної колекції)

Колекція: Assignment

Метод	Маршрут	Опис
POST	/assignments/bulk	Пакетне додавання студентів
GET	/assignments/highscores	Студенти з балами > 80
PUT	/assignments/increase-score	Підвищення балів студентам з score < 85
DELETE	/assignments/delete-lowest	Видалення студента з найнижчим балом
GET	/assignments/projection	Проекція: тільки name та score
⚙️ Встановлення та запуск
📋 Передумови

Node.js (v18+)

MongoDB Atlas або локальна MongoDB

1. Встановлення залежностей
npm install

2. Запуск сервера

Перевірте, що змінна середовища MONGO_URI або URI у server.js вказує на вашу базу даних:

node server.js


Сервер запущено на: http://localhost:3001

3. Тестування API (Postman / Thunder Client)

Вхід: POST http://localhost:3001/login (x-www-form-urlencoded)

CRUD TestItem: /db-ops/*

Assignments: /assignments/*

Використовуйте сесійну cookie для доступу до захищених маршрутів.

🧠 Автор

Yurii Zvirianskyj
Full Stack JS Developer
📦 GitHub: yurii0210