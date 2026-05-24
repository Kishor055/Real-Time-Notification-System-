
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for the API route
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * @api {post} /api/notify Send a real-time notification
 * @apiDescription Endpoint for external services to push notifications into the NovaPulse backbone.
 * 
 * @body {string} title The notification title.
 * @body {string} message The notification payload content.
 * @body {string} topic The target topic/room (e.g., 'trading', 'security').
 * @body {string} [severity] The severity level: 'low', 'medium', 'high', 'critical'.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, topic, severity = 'medium' } = body;

    if (!title || !message || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, topic' },
        { status: 400 }
      );
    }

    const notificationData = {
      userId: 'system-api',
      title,
      message,
      topic: topic.toLowerCase(),
      severity,
      status: 'unread',
      createdAt: new Date().toISOString(),
      source: 'External API'
    };

    // This acts as the "emit" or "broadcast" to all clients listening to this topic
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      timestamp: notificationData.createdAt
    });
  } catch (error: any) {
    console.error('API Notification Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
