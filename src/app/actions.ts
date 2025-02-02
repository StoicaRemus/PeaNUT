'use server'

import InfluxWriter from '@/server/influxdb'
import { DEVICE } from '@/common/types'
import { Nut } from '@/server/nut'
import { YamlSettings } from '@/server/settings'
import { server } from '@/common/types'

const settingsFile = './config/settings.yml'

async function connect(): Promise<Array<Nut>> {
  const settings = new YamlSettings(settingsFile)
  return settings
    .get('NUT_SERVERS')
    .map((server: any) => new Nut(server.HOST, server.PORT, server.USERNAME, server.PASSWORD))
}

export async function testConnection(server: string, port: number) {
  const nut = new Nut(server, port)
  return await nut.testConnection()
}

export async function testInfluxConnection(host: string, token: string, org: string, bucket: string) {
  const influxdata = new InfluxWriter(host, token, org, bucket)
  return await influxdata.testConnection()
}

export async function getDevices() {
  try {
    const nuts = await connect()
    const gridProps: Array<DEVICE> = []
    const devicePromises = nuts.map(async (nut) => {
      const devices = await nut.getDevices()
      const devicePromises = devices.map(async (device) => {
        const [data, rwVars] = await Promise.all([nut.getData(device.name), nut.getRWVars(device.name)])
        return {
          vars: data,
          rwVars,
          description: device.description === 'Description unavailable' ? '' : device.description,
          clients: [],
          commands: [],
          name: device.name,
        }
      })
      const resolvedDevices = await Promise.all(devicePromises)
      gridProps.push(...resolvedDevices)
    })
    await Promise.all(devicePromises)
    return { devices: gridProps, updated: new Date(), error: undefined }
  } catch (e: any) {
    return { devices: undefined, updated: new Date(), error: e.message }
  }
}

export async function getAllVarDescriptions(device: string, params: string[]) {
  try {
    const nut = (await connect()).find((nut) => nut.deviceExists(device))
    const data: { [x: string]: string } = {}
    if (!nut) {
      return { data: undefined, error: 'Device not found' }
    }
    const descriptions = await Promise.all(params.map((param) => nut.getVarDescription(device, param)))
    params.forEach((param, index) => {
      data[param] = descriptions[index]
    })
    return { data, error: undefined }
  } catch (e: any) {
    return { data: undefined, error: e.message }
  }
}

export async function saveVar(device: string, varName: string, value: string) {
  try {
    const nuts = await connect()
    const savePromises = nuts.map(async (nut) => {
      const deviceExists = await nut.deviceExists(device)
      if (deviceExists) {
        await nut.setVar(device, varName, value)
      }
    })
    await Promise.all(savePromises)
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function checkSettings(): Promise<boolean> {
  const settings = new YamlSettings(settingsFile)
  return !!settings.get('NUT_SERVERS') || [].length > 0
}

export async function getSettings(key: string) {
  const settings = new YamlSettings(settingsFile)
  return settings.get(key)
}

export async function setSettings(key: string, value: any) {
  const settings = new YamlSettings(settingsFile)
  settings.set(key, value)
}

export async function updateServers(servers: Array<server>) {
  const settings = new YamlSettings(settingsFile)

  settings.set('NUT_SERVERS', servers)
}

export async function deleteSettings(key: string) {
  const settings = new YamlSettings(settingsFile)
  settings.delete(key)
}

export async function disconnect() {
  const settings = new YamlSettings(settingsFile)
  settings.delete('NUT_SERVERS')
  settings.delete('NUT_HOST')
  settings.delete('NUT_PORT')
  settings.delete('USERNAME')
  settings.delete('PASSWORD')
  settings.delete('INFLUX_HOST')
  settings.delete('INFLUX_TOKEN')
  settings.delete('INFLUX_ORG')
  settings.delete('INFLUX_BUCKET')
}
