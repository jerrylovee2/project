import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'SecureVault_AES_256_Key_2024';
const DATA_DIR = path.join(process.cwd(), 'data', 'secrets');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function encryptData(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

function decryptData(encryptedData: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    ensureDataDir();
    const secretsFile = path.join(DATA_DIR, 'secrets.enc');

    if (!fs.existsSync(secretsFile)) {
      return NextResponse.json({ secrets: [] });
    }

    const encryptedData = fs.readFileSync(secretsFile, 'utf8');
    const secrets = decryptData(encryptedData);

    return NextResponse.json({ secrets });
  } catch (error) {
    console.error('Error reading secrets:', error);
    return NextResponse.json({ secrets: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, description } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    ensureDataDir();
    const secretsFile = path.join(DATA_DIR, 'secrets.enc');
    let secrets = [];

    if (fs.existsSync(secretsFile)) {
      const encryptedData = fs.readFileSync(secretsFile, 'utf8');
      secrets = decryptData(encryptedData);
    }

    const newSecret = {
      id: Date.now().toString(),
      email,
      password,
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    secrets.push(newSecret);
    const encryptedData = encryptData(secrets);
    fs.writeFileSync(secretsFile, encryptedData);

    return NextResponse.json({
      success: true,
      message: 'Secret added successfully',
      secret: newSecret,
    });
  } catch (error) {
    console.error('Error adding secret:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to add secret',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretId = searchParams.get('id');

    if (!secretId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Secret ID is required',
        },
        { status: 400 }
      );
    }

    ensureDataDir();
    const secretsFile = path.join(DATA_DIR, 'secrets.enc');

    if (!fs.existsSync(secretsFile)) {
      return NextResponse.json(
        {
          success: false,
          message: 'No secrets found',
        },
        { status: 404 }
      );
    }

    const encryptedData = fs.readFileSync(secretsFile, 'utf8');
    let secrets = decryptData(encryptedData);

    const updatedSecrets = secrets.filter((secret: any) => secret.id !== secretId);
    const newEncryptedData = encryptData(updatedSecrets);
    fs.writeFileSync(secretsFile, newEncryptedData);

    return NextResponse.json({
      success: true,
      message: 'Secret deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting secret:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete secret',
      },
      { status: 500 }
    );
  }
}