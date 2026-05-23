import { createPrivateKey } from "crypto"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import type { Bucket } from "@google-cloud/storage"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

let bucket: Bucket | null = null

type ServiceAccount = {
  project_id: string
  private_key: string
  client_email: string
  storage_bucket?: string
}

function loadFromEnvVars(): ServiceAccount | null {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  if (!projectId && !privateKey && !clientEmail) {
    return null
  }

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      "Firebase env credentials incomplete — set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL"
    )
  }

  return {
    project_id: projectId,
    private_key: privateKey,
    client_email: clientEmail,
    storage_bucket: process.env.FIREBASE_STORAGE_BUCKET,
  }
}

function loadFromJsonFile(): ServiceAccount | null {
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  const serviceAccountPath = pathEnv
    ? pathEnv
    : join(process.cwd(), "firebase-service-account.json")

  if (!existsSync(serviceAccountPath)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(serviceAccountPath, "utf8")) as ServiceAccount
  } catch {
    throw new Error(`Failed to read Firebase service account from ${serviceAccountPath}`)
  }
}

function loadServiceAccount(): ServiceAccount {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (jsonEnv) {
    try {
      return JSON.parse(jsonEnv) as ServiceAccount
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON")
    }
  }

  const fromFile = loadFromJsonFile()
  if (fromFile) {
    return fromFile
  }

  const fromEnv = loadFromEnvVars()
  if (fromEnv) {
    return fromEnv
  }

  throw new Error(
    "Firebase service account not found. Add firebase-service-account.json to project root, or set FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL."
  )
}

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, "\n").trim()
}

function validatePrivateKey(privateKey: string): void {
  try {
    createPrivateKey(privateKey)
  } catch {
    throw new Error(
      "Invalid Firebase private_key — regenerate the key from Firebase Console and update FIREBASE_PRIVATE_KEY or firebase-service-account.json"
    )
  }
}

function getStorageBucketName(serviceAccount: ServiceAccount): string {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ||
    serviceAccount.storage_bucket ||
    `${serviceAccount.project_id}.firebasestorage.app`
  )
}

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return { app: getApps()[0], storage: getStorage() }
  }

  const serviceAccount = loadServiceAccount()

  if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
    throw new Error("Firebase service account credentials are incomplete")
  }

  const privateKey = normalizePrivateKey(serviceAccount.private_key)
  validatePrivateKey(privateKey)

  const app = initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey,
    }),
    storageBucket: getStorageBucketName(serviceAccount),
  })

  return { app, storage: getStorage(app) }
}

export function getStorageBucket(): Bucket {
  if (!bucket) {
    const firebaseStorage = getFirebaseAdmin().storage
    bucket = firebaseStorage.bucket()
  }
  return bucket
}
