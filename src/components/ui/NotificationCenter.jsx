import React, { useState, useEffect } from "react";

/**
 * NotificationCenter component for displaying game notifications and alerts
 */
const NotificationCenter = React.memo(({ notifications = [], onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Update visible notifications when props change
  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Handle dismissing a notification
  const handleDismiss = (id) => {
    setVisibleNotifications((prev) => prev.filter((notif) => notif.id !== id));

    if (onDismiss) {
      onDismiss(id);
    }
  };

  // If no notifications, don't render anything
  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className="notification-center"
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "300px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type || "info"}`}
          style={{
            padding: "12px 15px",
            borderRadius: "4px",
            backgroundColor: getNotificationColor(notification.type),
            color: "#e1e1e1",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            position: "relative",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.7)",
              cursor: "pointer",
              fontSize: "14px",
              padding: "2px",
              lineHeight: 1,
            }}
            onClick={() => handleDismiss(notification.id)}
          >
            ×
          </button>

          <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
            {notification.title}
          </div>

          <div style={{ fontSize: "14px" }}>{notification.message}</div>

          {notification.action && (
            <button
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "2px",
                padding: "5px 10px",
                marginTop: "10px",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "12px",
              }}
              onClick={() => {
                notification.action.onClick();
                handleDismiss(notification.id);
              }}
            >
              {notification.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
});

// Helper function to get notification background color
function getNotificationColor(type) {
  switch (type) {
    case "success":
      return "#2e4c34"; // Green
    case "warning":
      return "#4c3e2e"; // Yellow-orange
    case "danger":
      return "#4c2e2e"; // Red
    case "special":
      return "#3e2e4c"; // Purple
    case "info":
    default:
      return "#2e3e4c"; // Blue
  }
}

// Add display name for debugging
NotificationCenter.displayName = "NotificationCenter";

export default NotificationCenter;
