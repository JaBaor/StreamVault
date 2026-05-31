const cron = require("node-cron");
const pool = require("../config/db");
const emailService = require("./emailService");
const notificationModel = require("../models/notificationModel");

const GRACE_PERIOD_DAYS = 3;

function startCronJobs() {
  cron.schedule("0 6 * * *", async () => {
    console.log("[Cron] Checking subscription expiries...");
    try {
      const [rows] = await pool.query(
        `SELECT u.id, u.email, u.display_name, s.end_date,
                DATEDIFF(s.end_date, CURDATE()) AS days_left
         FROM subscriptions s
         JOIN users u ON s.user_id = u.id
         WHERE s.status = 'ACTIVE'
           AND s.plan != 'FREE'
           AND s.end_date IS NOT NULL
           AND DATEDIFF(s.end_date, CURDATE()) BETWEEN 0 AND 3`
      );

      for (const row of rows) {
        const daysLeft = Number(row.days_left);
        if (daysLeft <= 0) {
          await pool.query(
            "UPDATE subscriptions SET status = 'EXPIRED' WHERE user_id = ? AND status = 'ACTIVE'",
            [row.id]
          );
          await pool.query("UPDATE users SET role = 'GUEST' WHERE id = ?", [row.id]);
          await notificationModel.createNotification({
            userId: row.id,
            type: "subscription_expired",
            title: "Subscription Expired",
            message: "Your premium subscription has ended. Renew to continue enjoying premium content.",
          });
        } else {
          await notificationModel.createNotification({
            userId: row.id,
            type: "subscription_expiring",
            title: "Subscription Expiring Soon",
            message: `Your subscription expires in ${daysLeft} day(s).`,
          });
          await emailService.sendExpiryReminder(row, daysLeft);
        }
      }
    } catch (err) {
      console.error("[Cron] Expiry check error:", err);
    }
  });

  console.log("[Cron] Jobs started");
}

module.exports = { startCronJobs };
