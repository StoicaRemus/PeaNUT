import { DEVICE, VARS } from '@/common/types'
import { Nut } from '@/server/nut'
import {
  getAllVarDescriptions,
  getDevices,
  testConnection,
  saveVar,
  checkSettings,
  getSettings,
  setSettings,
  deleteSettings,
  disconnect,
} from '@/app/actions'
import { YamlSettings } from '@/server/settings'
import PromiseSocket from '@/server/promise-socket'

const vars: VARS = {}

const result: Array<DEVICE> = [
  {
    clients: [],
    commands: [],
    description: 'bar',
    name: 'foo',
    rwVars: ['battery.charge'],
    vars: {},
  },
]

beforeAll(() => {
  jest
    .spyOn(Nut.prototype, 'getDevices')
    .mockResolvedValue([
      { name: 'foo', description: 'bar', rwVars: ['battery.charge'], vars: {}, commands: [], clients: [] },
    ])
  jest.spyOn(Nut.prototype, 'getData').mockResolvedValue(vars)
  jest.spyOn(Nut.prototype, 'getRWVars').mockResolvedValue(['battery.charge'])
  jest.spyOn(Nut.prototype, 'getVarDescription').mockResolvedValue('test')
  jest.spyOn(Nut.prototype, 'setVar').mockResolvedValue()
  jest.spyOn(Nut.prototype, 'checkCredentials').mockResolvedValue()
  jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
  jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
  jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  jest.spyOn(YamlSettings.prototype, 'get').mockImplementation((key: string) => {
    const settings = {
      NUT_SERVERS: [{ host: 'localhost', port: 3493, username: 'user', password: 'pass' }],
    }
    return settings[key as keyof typeof settings]
  })
  jest.spyOn(YamlSettings.prototype, 'set').mockImplementation(() => {})
  jest.spyOn(YamlSettings.prototype, 'delete').mockImplementation(() => {})
})

describe('actions', () => {
  it('gets devices', async () => {
    const data = await getDevices()
    expect(data.devices).toEqual(result)
  })

  it('gets all var descriptions', async () => {
    const data = await getAllVarDescriptions('ups', ['battery.charge'])
    expect(data?.data && data.data['battery.charge']).toEqual('test')
  })

  it('tests connection', () => {
    expect(testConnection('localhost', 3493)).resolves.toBe('Connection successful')
  })

  it('saves variable', async () => {
    const data = await saveVar('ups', 'battery.charge', '100')
    expect(data).toBeUndefined()
  })

  it('checks settings', async () => {
    const data = await checkSettings()
    expect(data).toBe(true)
  })

  it('gets settings', async () => {
    const data = await getSettings('NUT_SERVERS')
    expect(data[0].host).toBe('localhost')
  })

  it('sets settings', async () => {
    await setSettings('NUT_HOST', '127.0.0.1')
    expect(YamlSettings.prototype.set).toHaveBeenCalledWith('NUT_HOST', '127.0.0.1')
  })

  it('deletes settings', async () => {
    await deleteSettings('NUT_HOST')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('NUT_HOST')
  })

  it('disconnects', async () => {
    await disconnect()
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('NUT_HOST')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('NUT_PORT')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('USERNAME')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('PASSWORD')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_HOST')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_TOKEN')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_ORG')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_BUCKET')
  })
})
