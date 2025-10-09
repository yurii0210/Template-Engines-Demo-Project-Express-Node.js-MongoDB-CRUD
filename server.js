const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// --- Підключення до MongoDB Atlas ---
const mongoDB_URI = 'mongodb+srv://uriy0210:Madeta2025_@cluster0.etb7pyd.mongodb.net/template-engines?retryWrites=true&w=majority';
mongoose.connect(mongoDB_URI)
    .then(() => console.log('Підключено до MongoDB Atlas!'))
    .catch(err => console.error('Помилка підключення:', err));

// --- Моделі MongoDB ---
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    age: Number,
    position: String,
    avatar: { type: String, default: '/images/default-avatar.jpg' },
    bio: String,
    resetToken: String,
    resetTokenExpiration: Date,
});
const User = mongoose.model('User', userSchema);

const articleSchema = new mongoose.Schema({
    title: String,
    author: String,
    date: String,
    content: String,
    category: String,
    tags: [String],
    image: String
});
const Article = mongoose.model('Article', articleSchema);

const testSchema = new mongoose.Schema({
    name: String,
    value: Number,
    category: String,
    tags: [String]
});
const TestItem = mongoose.model('TestItem', testSchema);

// --- Ініціалізація Express ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Passport Configuration ---
passport.use(new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return done(null, false, { message: 'Неправильний email або пароль.' });
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: 'Неправильний email або пароль.' });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// --- Допоміжна функція ---
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// --- View engines & Global variables ---
app.engine('pug', require('pug').__express);
app.engine('ejs', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user; // Передача об'єкта користувача
    res.locals.theme = req.cookies.theme || 'light';
    next();
});

// --- Маршрути авторизації ---
app.get('/login', (req, res) => res.render('pug/login.pug', { title: 'Вхід', currentPath: '/login' }));
app.post('/login', passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/login' }));
app.get('/register', (req, res) => res.render('pug/register.pug', { title: 'Реєстрація', currentPath: '/register' }));
app.post('/register', async (req, res, next) => {
    try {
        const { email, password, name, age, position, bio } = req.body;
        if (await User.findOne({ email })) {
            return res.render('pug/register.pug', { error: 'Цей email вже зареєстровано.', title: 'Реєстрація', currentPath: '/register' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, age, position, bio });
        await newUser.save();
        req.login(newUser, err => {
            if (err) return next(err);
            res.redirect('/profile');
        });
    } catch (err) {
        next(err);
    }
});
app.get('/logout', (req, res, next) => {
    req.logout(err => { if (err) return next(err); res.redirect('/'); });
});

// --- Маршрут для зміни теми ---
app.get('/set-theme/:theme', (req, res) => {
    const theme = req.params.theme === 'dark' ? 'dark' : 'light';
    res.cookie('theme', theme, { maxAge: 1000 * 60 * 60 * 24 * 30 });
    const redirectTo = req.get('Referrer') || '/';
    res.redirect(redirectTo);
});

// --- Захищені маршрути ---
app.get('/profile', isAuthenticated, (req, res) => res.render('pug/profile.pug', { title: 'Профіль', currentPath: '/profile' }));
app.get('/protected', isAuthenticated, (req, res) => res.render('pug/protected.pug', { title: 'Захищена сторінка', currentPath: '/protected' }));

// --- Основні сторінки ---
app.get('/', async (req, res) => {
    const usersCount = await User.countDocuments();
    const articlesCount = await Article.countDocuments();
    res.render('pug/home.pug', {
        title: 'Головна сторінка - Template Engines Demo',
        usersCount,
        articlesCount,
        currentPath: '/'
    });
});

// --- Маршрути користувачів (Users) ---
app.get('/users', async (req, res) => {
    const users = await User.find({});
    res.render('pug/users.pug', {
        title: 'Список користувачів',
        users,
        currentPath: '/users'
    });
});

app.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).send('Користувача не знайдено');
        }
        res.render('pug/user-details.pug', {
            title: `Користувач: ${user.name}`,
            user,
            currentPath: '/users'
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).send('Користувача не знайдено');
        }
        res.status(500).send('Помилка сервера при завантаженні користувача');
    }
});

// GET: форма редагування користувача
app.get('/users/edit/:userId', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).send('Користувача не знайдено');
        res.render('pug/edit-user.pug', { title: `Редагувати ${user.name}`, user });
    } catch (err) {
        res.status(500).send('Помилка сервера при завантаженні користувача');
    }
});

// POST: збереження змін користувача
app.post('/users/edit/:userId', isAuthenticated, async (req, res) => {
    try {
        const { name, email, age, position, bio } = req.body;
        const user = await User.findByIdAndUpdate(req.params.userId, {
            name, email, age, position, bio
        }, { new: true });

        if (!user) return res.status(404).send('Користувача не знайдено');

        res.redirect(`/users/${req.params.userId}`);
    } catch (err) {
        res.status(500).send('Помилка сервера при оновленні користувача');
    }
});


// --- МАРШРУТ: Видалення користувача ---
app.post('/users/delete/:userId', isAuthenticated, async (req, res, next) => {
    const userId = req.params.userId;

    try {
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).send('Користувача не знайдено для видалення.');
        }

        if (req.user && req.user._id.toString() === userId) {
            req.logout(err => {
                if (err) return next(err);
                res.redirect('/');
            });
        } else {
            res.redirect('/users');
        }

    } catch (err) {
        if (err.kind === 'ObjectId') {
             return res.status(400).send('Некоректний ідентифікатор користувача.');
        }
        console.error("Помилка при видаленні користувача:", err);
        res.status(500).send('Помилка сервера при видаленні користувача.');
    }
});

// --- Маршрути статей (Articles CRUD) ---
app.get('/articles', async (req, res) => {
    try {
        const articles = await Article.find({});
        res.render('ejs/articles.ejs', {
            title: 'Список статей',
            articles,
            currentPath: '/articles'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка завантаження статей');
    }
});

app.get('/articles/add', isAuthenticated, (req, res) => {
    res.render('pug/add-article.pug', {
        title: 'Додати статтю',
        currentPath: '/articles/add'
    });
});

app.post('/articles/add', isAuthenticated, async (req, res) => {
    try {
        const { title, author, image, content, tags, category } = req.body;
        const newArticle = new Article({
            title,
            author,
            image,
            content,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            date: new Date().toLocaleDateString('uk-UA')
        });
        await newArticle.save();
        res.redirect('/articles');
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка при додаванні статті.');
    }
});

app.get('/articles/:articleId', async (req, res) => {
    try {
        const article = await Article.findById(req.params.articleId);
        if (!article) {
            return res.status(404).send('Статтю не знайдено');
        }
        res.render('ejs/article-details.ejs', {
            title: article.title,
            article,
            currentPath: '/articles'
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).send('Статтю не знайдено');
        }
        res.status(500).send('Помилка сервера при завантаженні статті');
    }
});

// --- ДОДАТКОВІ МАРШРУТИ ДЛЯ ТЕСТОВОГО CRUD (використовуємо JSON) ---

// 1. СТВОРЕННЯ (Create)
// Реалізовано: insertOne та insertMany
app.post('/db-ops/insert-one', isAuthenticated, async (req, res) => {
    try {
        const newItem = new TestItem({
            name: req.body.name || 'New Item',
            value: req.body.value || 100,
            category: req.body.category || 'Demo' // Використовуємо category з тіла запиту
        });
        const result = await newItem.save();
        res.status(201).json({ message: 'insertOne: Документ успішно додано', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/db-ops/insert-many', isAuthenticated, async (req, res) => {
    try {
        const items = req.body.items || [ // Дозволяємо передавати масив у тілі запиту
            { name: 'Batch Item 1', value: 200, category: 'Batch' },
            { name: 'Batch Item 2', value: 250, category: 'Batch' },
        ];
        const result = await TestItem.insertMany(items);
        res.status(201).json({ message: 'insertMany: Документи успішно додано', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ОНОВЛЕННЯ (Update)
// Реалізовано: updateOne, updateMany та replaceOne
app.put('/db-ops/update-one/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await TestItem.updateOne(
            { _id: req.params.id },
            { $set: { value: req.body.value || 999, category: req.body.category || 'Updated' } }
        );
        res.json({ message: 'updateOne: Документ оновлено', result });
    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ error: 'Некоректний ідентифікатор.' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.put('/db-ops/update-many', isAuthenticated, async (req, res) => {
    try {
        const result = await TestItem.updateMany(
            { category: req.body.filterCategory || 'Batch' }, // Фільтруємо за категорією з тіла запиту або "Batch"
            { $set: { tags: ['many-updated', 'batch-op'] } }
        );
        res.json({ message: `updateMany: Оновлено ${result.modifiedCount} документів`, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/db-ops/replace-one/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await TestItem.replaceOne(
            { _id: req.params.id },
            { name: req.body.name || 'Replacement', value: req.body.value || 0, category: 'Replaced' }
        );
        res.json({ message: 'replaceOne: Документ замінено', result });
    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ error: 'Некоректний ідентифікатор.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// 3. ВИДАЛЕННЯ (Delete)
// Реалізовано: deleteOne та deleteMany
app.delete('/db-ops/delete-one/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await TestItem.deleteOne({ _id: req.params.id });
        res.json({ message: 'deleteOne: Документ видалено', result });
    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ error: 'Некоректний ідентифікатор.' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.delete('/db-ops/delete-many', isAuthenticated, async (req, res) => {
    try {
        const result = await TestItem.deleteMany({ category: req.body.category || 'Batch' }); // Видаляємо за категорією
        res.json({ message: `deleteMany: Видалено ${result.deletedCount} документів`, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. РОЗШИРЕНЕ ЧИТАННЯ (Advanced Read)
// Реалізовано: find з проекцією (projection)
app.get('/db-ops/find-with-projection', async (req, res) => {
    try {
        // Проекція: включити name та value, виключити _id
        const result = await TestItem.find({}, { name: 1, value: 1, _id: 0 });
        res.json({ message: 'find (з проекцією): Успішно', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Обробка 404 та 500 помилок ---
app.use((req, res) => res.status(404).send('Сторінку не знайдено'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Щось пішло не так!');
});

// --- Запуск ---
app.listen(PORT, () => console.log(`Сервер запущено на http://localhost:${PORT}`));