import { expect, test } from '@playwright/test'

test.describe('Var', () => {
  test('should get var', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/var/device.serial')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toBe('test1')
  })

  test('should save var', async ({ request }) => {
    const create = await request.post('/api/v1/devices/ups/var/battery.charge.low', { data: '9' })
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toBe('Variable battery.charge.low on device ups saved successfully')
  })
})
