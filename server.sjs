/* ============================================================
   CHOCOHUNT — Node.js Express Backend
   Managed & Designed by LeadKnight
   Run: npm install && node server.js
   ============================================================ */

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs         = require('fs');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'chocohunt_secret_2024_leadknight';

/* ── MIDDLEWARE ── */
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── SERVE STATIC FRONTEND ── */
app.use(express.static(path.join(__dirname, '..')));

/* ── SIMPLE FILE-BASED DB (no MongoDB needed to run) ── */
const DB_PATH = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const init = { users: [], contacts: [], reviews: [], newsletters: [], partners: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/* ── EMAIL TRANSPORTER (configure your SMTP) ── */
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'hello@chocohunt.in',
    pass: process.env.SMTP_PASS || 'your_app_password_here',
  },
});

async function sendMail(to, subject, html) {
  try {
    await mailer.sendMail({
      from: '"ChocoHunt 🍫" <hello@chocohunt.in>',
      to, subject, html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.log('📧 Email not sent (configure SMTP):', err.message);
  }
}

/* ── AUTH MIDDLEWARE ── */
function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/* ════════════════════════════════════════════════════
   AUTH ROUTES
════════════════════════════════════════════════════ */

/* POST /api/auth/register */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const db = loadDB();
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(400).json({ message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    saveDB(db);

    // Welcome email
    await sendMail(email, 'Welcome to ChocoHunt! 🍫', `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#1a0a00;color:#f5ede0;padding:3rem">
        <h1 style="font-weight:300;color:#f5ede0;font-size:2.5rem;margin-bottom:.5rem">Welcome, ${name}!</h1>
        <p style="color:#c8962c;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:2rem">Crafted for True Chocolate Lovers</p>
        <p style="color:rgba(245,237,224,.7);line-height:1.8">Thank you for joining the ChocoHunt family. You now have access to exclusive collections, early access to limited editions, and our most luxurious gifting experiences.</p>
        <a href="http://localhost:3000/collection.html" style="display:inline-block;margin-top:2rem;padding:1rem 2.5rem;background:#c8962c;color:#0d0704;text-decoration:none;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:500">Shop Now</a>
        <p style="color:rgba(245,237,224,.3);font-size:.75rem;margin-top:3rem">Managed & Designed by LeadKnight</p>
      </div>
    `);

    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* POST /api/auth/login */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user)
      return res.status(401).json({ message: 'No account found with this email' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* GET /api/auth/me */
app.get('/api/auth/me', authRequired, (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...safe } = user;
  res.json(safe);
});

/* ════════════════════════════════════════════════════
   CONTACT ROUTE
════════════════════════════════════════════════════ */

/* POST /api/contact */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'Name, email and message are required' });

    const db = loadDB();
    const entry = {
      id: `c_${Date.now()}`,
      name, email, phone: phone || '',
      subject: subject || 'General Enquiry',
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    db.contacts.push(entry);
    saveDB(db);

    // Notify admin
    await sendMail('hello@chocohunt.in', `New Contact: ${subject || 'General Enquiry'} — ${name}`, `
      <div style="font-family:sans-serif;max-width:500px">
        <h2>New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:.5rem;font-weight:bold;width:100px">Name</td><td style="padding:.5rem">${name}</td></tr>
          <tr><td style="padding:.5rem;font-weight:bold">Email</td><td style="padding:.5rem">${email}</td></tr>
          <tr><td style="padding:.5rem;font-weight:bold">Phone</td><td style="padding:.5rem">${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:.5rem;font-weight:bold">Subject</td><td style="padding:.5rem">${subject || 'General'}</td></tr>
          <tr><td style="padding:.5rem;font-weight:bold;vertical-align:top">Message</td><td style="padding:.5rem">${message}</td></tr>
        </table>
      </div>
    `);

    // Auto-reply to customer
    await sendMail(email, 'We received your message — ChocoHunt 🍫', `
      <div style="font-family:Georgia,serif;max-width:560px;background:#1a0a00;color:#f5ede0;padding:3rem">
        <h1 style="font-weight:300;font-size:2rem;color:#f5ede0">Hello, ${name}!</h1>
        <p style="color:#c8962c;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:1.5rem">Message Received</p>
        <p style="color:rgba(245,237,224,.7);line-height:1.8">Thank you for reaching out to ChocoHunt. We've received your message and our team will get back to you within 24 hours.</p>
        <div style="margin:2rem 0;padding:1.5rem;border:1px solid rgba(200,150,44,.2)">
          <p style="color:rgba(245,237,224,.5);font-size:.85rem;margin:0"><strong style="color:#c8962c">Your enquiry:</strong> ${subject || 'General Enquiry'}</p>
        </div>
        <p style="color:rgba(245,237,224,.4);font-size:.75rem;margin-top:2rem">ChocoHunt Atelier · Kothrud, Pune | hello@chocohunt.in</p>
      </div>
    `);

    res.json({ message: 'Message received successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

/* GET /api/contact (admin) */
app.get('/api/contact', authRequired, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  const db = loadDB();
  res.json(db.contacts.reverse());
});

/* ════════════════════════════════════════════════════
   REVIEWS ROUTES
════════════════════════════════════════════════════ */

/* POST /api/reviews */
app.post('/api/reviews', async (req, res) => {
  try {
    const { name, email, product, rating, review } = req.body;
    if (!name || !email || !review)
      return res.status(400).json({ message: 'Name, email and review are required' });

    const db = loadDB();
    const entry = {
      id: `r_${Date.now()}`,
      name, email,
      product: product || 'ChocoHunt',
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      review,
      approved: false,
      createdAt: new Date().toISOString(),
    };
    db.reviews.push(entry);
    saveDB(db);

    res.status(201).json({ message: 'Review submitted for approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

/* GET /api/reviews (public - approved only) */
app.get('/api/reviews', (req, res) => {
  const db = loadDB();
  const approved = db.reviews.filter(r => r.approved).reverse();
  res.json(approved);
});

/* PATCH /api/reviews/:id/approve (admin) */
app.patch('/api/reviews/:id/approve', authRequired, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  const db = loadDB();
  const rev = db.reviews.find(r => r.id === req.params.id);
  if (!rev) return res.status(404).json({ message: 'Review not found' });
  rev.approved = true;
  saveDB(db);
  res.json({ message: 'Review approved' });
});

/* ════════════════════════════════════════════════════
   NEWSLETTER ROUTE
════════════════════════════════════════════════════ */

/* POST /api/newsletter */
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const db = loadDB();
    const exists = db.newsletters.find(n => n.email.toLowerCase() === email.toLowerCase());
    if (exists)
      return res.json({ message: 'Already subscribed!' });

    db.newsletters.push({
      id: `n_${Date.now()}`,
      email: email.toLowerCase().trim(),
      subscribedAt: new Date().toISOString(),
    });
    saveDB(db);

    await sendMail(email, 'Welcome to ChocoHunt Newsletter 🍫', `
      <div style="font-family:Georgia,serif;max-width:560px;background:#1a0a00;color:#f5ede0;padding:3rem">
        <h1 style="font-weight:300;font-size:2rem;color:#f5ede0">You're subscribed! 🍫</h1>
        <p style="color:rgba(245,237,224,.7);line-height:1.8;margin-top:1rem">Welcome to the ChocoHunt inner circle. You'll be the first to know about new collections, limited edition drops, and exclusive offers.</p>
      </div>
    `);

    res.json({ message: 'Subscribed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Subscription failed' });
  }
});

/* ════════════════════════════════════════════════════
   PARTNER ENQUIRY ROUTE
════════════════════════════════════════════════════ */

/* POST /api/partner */
app.post('/api/partner', async (req, res) => {
  try {
    const { business, contact, email, phone, city, type, message } = req.body;
    if (!business || !email || !contact)
      return res.status(400).json({ message: 'Business name, contact and email are required' });

    const db = loadDB();
    db.partners.push({
      id: `p_${Date.now()}`,
      business, contact, email, phone, city, type,
      message: message || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    saveDB(db);

    await sendMail('partners@chocohunt.in', `New Partner Enquiry: ${business}`, `
      <div style="font-family:sans-serif">
        <h2>New Partnership Enquiry</h2>
        <p><strong>Business:</strong> ${business}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Message:</strong> ${message}</p>
      </div>
    `);

    res.status(201).json({ message: 'Partnership enquiry submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit enquiry' });
  }
});

/* ════════════════════════════════════════════════════
   ADMIN DASHBOARD DATA
════════════════════════════════════════════════════ */

/* GET /api/admin/stats */
app.get('/api/admin/stats', authRequired, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  const db = loadDB();
  res.json({
    users:       db.users.length,
    contacts:    db.contacts.length,
    reviews:     db.reviews.length,
    approved:    db.reviews.filter(r => r.approved).length,
    newsletters: db.newsletters.length,
    partners:    db.partners.length,
  });
});

/* GET /api/admin/users */
app.get('/api/admin/users', authRequired, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  const db = loadDB();
  res.json(db.users.map(u => { const { password: _, ...s } = u; return s; }));
});

/* ── HEALTH CHECK ── */
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', brand: 'ChocoHunt', by: 'LeadKnight', time: new Date().toISOString() });
});

/* ── 404 HANDLER ── */
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'home.html'));
});

/* ── START SERVER ── */
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🍫  ChocoHunt Backend Server           ║
  ║   Managed & Designed by LeadKnight       ║
  ╠══════════════════════════════════════════╣
  ║   Local:   http://localhost:${PORT}         ║
  ║   Health:  http://localhost:${PORT}/api/health  ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
