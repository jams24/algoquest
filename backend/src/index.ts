import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import problemRoutes from './routes/problems';
import progressRoutes from './routes/progress';
import leaderboardRoutes from './routes/leaderboard';
import dailyRoutes from './routes/daily';
import gamificationRoutes from './routes/gamification';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Privacy Policy
app.get('/privacy', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AlgoQuest - Privacy Policy</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#0F0F1F;color:#E0E0E0;line-height:1.7;padding:40px 20px}
.container{max-width:800px;margin:0 auto}.logo{text-align:center;margin-bottom:32px}.logo h1{font-size:32px;font-weight:900;color:#58CC02}
.logo p{color:#888;font-size:14px}h2{color:#58CC02;font-size:20px;margin:28px 0 12px;padding-top:16px;border-top:1px solid #2A2A3E}
p,li{font-size:15px;color:#CCC;margin-bottom:10px}ul{padding-left:24px;margin-bottom:16px}
a{color:#1CB0F6}.updated{text-align:center;color:#888;font-size:13px;margin-top:40px;padding-top:20px;border-top:1px solid #2A2A3E}</style>
</head><body><div class="container">
<div class="logo"><h1>AlgoQuest</h1><p>Privacy Policy</p></div>

<h2>1. Information We Collect</h2>
<p>When you use AlgoQuest, we collect:</p>
<ul>
<li><strong>Account Information:</strong> Email address, username, and password (hashed) when you register, or your Google profile information (name, email, profile picture) if you sign in with Google.</li>
<li><strong>Learning Data:</strong> Your progress through problems, quiz scores, XP earned, streak data, and achievements.</li>
<li><strong>Device Information:</strong> Device type and operating system version for app compatibility.</li>
<li><strong>Subscription Data:</strong> Purchase history and subscription status managed through RevenueCat.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<ul>
<li>To provide and personalize your learning experience</li>
<li>To track your progress, streaks, and achievements</li>
<li>To display leaderboard rankings</li>
<li>To manage your subscription and free trial</li>
<li>To send important account-related notifications</li>
<li>To improve the app and fix issues</li>
</ul>

<h2>3. Data Sharing</h2>
<p>We do not sell your personal data. We share data only with:</p>
<ul>
<li><strong>RevenueCat:</strong> For subscription and payment processing</li>
<li><strong>Google:</strong> For authentication when you use Google Sign-In</li>
<li><strong>Hosting providers:</strong> Our servers that store your account and progress data</li>
</ul>

<h2>4. Data Security</h2>
<p>We protect your data using industry-standard measures including encrypted connections (HTTPS), hashed passwords (bcrypt), and secure JWT token authentication. We never store your password in plain text.</p>

<h2>5. Data Retention</h2>
<p>Your account data is retained as long as your account is active. You can request deletion of your account and all associated data by contacting us at support@algoquest.app.</p>

<h2>6. Children's Privacy</h2>
<p>AlgoQuest is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us.</p>

<h2>7. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Correct inaccurate data</li>
<li>Request deletion of your account</li>
<li>Export your learning progress data</li>
</ul>

<h2>8. Third-Party Services</h2>
<p>AlgoQuest uses the following third-party services:</p>
<ul>
<li>Google Sign-In (authentication)</li>
<li>RevenueCat (subscription management)</li>
</ul>
<p>Each service has its own privacy policy governing the data they collect.</p>

<h2>9. Changes to This Policy</h2>
<p>We may update this policy from time to time. We will notify you of significant changes through the app or via email.</p>

<h2>10. Contact Us</h2>
<p>If you have questions about this privacy policy or your data, contact us at:</p>
<p><strong>Email:</strong> support@algoquest.app</p>

<p class="updated">Last updated: April 18, 2026</p>
</div></body></html>`);
});

// Terms of Service
app.get('/terms', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AlgoQuest - Terms of Service</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#0F0F1F;color:#E0E0E0;line-height:1.7;padding:40px 20px}
.container{max-width:800px;margin:0 auto}.logo{text-align:center;margin-bottom:32px}.logo h1{font-size:32px;font-weight:900;color:#58CC02}
.logo p{color:#888;font-size:14px}h2{color:#58CC02;font-size:20px;margin:28px 0 12px;padding-top:16px;border-top:1px solid #2A2A3E}
p,li{font-size:15px;color:#CCC;margin-bottom:10px}ul{padding-left:24px;margin-bottom:16px}
a{color:#1CB0F6}.updated{text-align:center;color:#888;font-size:13px;margin-top:40px;padding-top:20px;border-top:1px solid #2A2A3E}</style>
</head><body><div class="container">
<div class="logo"><h1>AlgoQuest</h1><p>Terms of Service</p></div>

<h2>1. Acceptance of Terms</h2>
<p>By downloading or using AlgoQuest, you agree to these Terms of Service. If you do not agree, do not use the app.</p>

<h2>2. Description of Service</h2>
<p>AlgoQuest is a gamified mobile application for learning Data Structures and Algorithms (DSA), featuring 150 NeetCode problems with interactive lessons, quizzes, and interview preparation tools.</p>

<h2>3. Accounts</h2>
<p>You must create an account to use AlgoQuest. You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration.</p>

<h2>4. Subscriptions & Free Trial</h2>
<ul>
<li>AlgoQuest offers a 3-day free trial for new users</li>
<li>After the trial, a paid subscription is required for full access</li>
<li>Subscriptions are managed through Google Play and processed by RevenueCat</li>
<li>You can cancel your subscription at any time through Google Play</li>
<li>Refunds are handled according to Google Play's refund policy</li>
</ul>

<h2>5. Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
<li>Share your account with others</li>
<li>Attempt to reverse-engineer, hack, or exploit the app</li>
<li>Use the app for any illegal purpose</li>
<li>Redistribute the educational content without permission</li>
</ul>

<h2>6. Intellectual Property</h2>
<p>All content in AlgoQuest, including lessons, explanations, code solutions, quizzes, and visual assets, is the property of AlgoQuest and is protected by copyright.</p>

<h2>7. Disclaimer</h2>
<p>AlgoQuest is provided "as is" without warranties. We do not guarantee that using AlgoQuest will result in passing any specific interview or exam.</p>

<h2>8. Limitation of Liability</h2>
<p>AlgoQuest shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.</p>

<h2>9. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.</p>

<h2>10. Contact</h2>
<p><strong>Email:</strong> support@algoquest.app</p>

<p class="updated">Last updated: April 18, 2026</p>
</div></body></html>`);
});

app.listen(PORT, () => {
  console.log(`AlgoQuest API running on port ${PORT}`);
});

export default app;
