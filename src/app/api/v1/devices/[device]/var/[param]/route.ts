import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'

import { Nut } from '@/server/nut'

// api/v1/devices/[device]/var/[param]
export async function GET(request: NextRequest, { params }: { params: any }) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()

  const device = params.device
  const param = params.param
  const paramString = param as keyof DEVICE
  try {
    const data = await nut.getVar(device, param)
    await nut.close()
    if (data === undefined) {
      return NextResponse.json(`Parameter ${paramString.toString()} not found`, {
        status: 404,
      })
    }
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(`Parameter ${paramString.toString()} on device ${device} not found`, { status: 404 })
  }
}

// api/v1/devices/[device]/var/[param]
export async function POST(request: NextRequest, { params }: { params: any }) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()

  const device = params.device
  const param = params.param
  const value = await request.json()

  try {
    await nut.setVar(device, param, value)
    await nut.close()
    return NextResponse.json(`Variable ${param} on device ${device} saved successfully`)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Failed to save variable ${param} on device ${device}`, { status: 500 })
  }
}
