import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SettingsWrapper from '@/client/components/settings-wrapper'
import { LanguageContext } from '@/client/context/language'
// import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      replace: jest.fn(),
    }
  },
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ name: '1.0.0' }]),
  })
) as jest.Mock

const mockCheckSettingsAction = jest.fn()
const mockGetSettingsAction = jest.fn()
const mockSetSettingsAction = jest.fn()
const mockUpdateServersAction = jest.fn()
const mockTestConnectionAction = jest.fn().mockResolvedValue('success')
const mockTestInfluxConnectionAction = jest.fn()

const renderComponent = () =>
  render(
    <LanguageContext.Provider value='en'>
      <SettingsWrapper
        checkSettingsAction={mockCheckSettingsAction}
        getSettingsAction={mockGetSettingsAction}
        setSettingsAction={mockSetSettingsAction}
        updateServersAction={mockUpdateServersAction}
        testConnectionAction={mockTestConnectionAction}
        testInfluxConnectionAction={mockTestInfluxConnectionAction}
      />
    </LanguageContext.Provider>
  )

describe('SettingsWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the settings wrapper component', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    mockGetSettingsAction.mockResolvedValueOnce('localhost')
    mockGetSettingsAction.mockResolvedValueOnce(8080)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('settings-wrapper')).toBeInTheDocument()
    })
  })

  it('loads server settings if settings check passes', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    mockGetSettingsAction.mockResolvedValueOnce('localhost')
    mockGetSettingsAction.mockResolvedValueOnce(8080)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Manage Servers')).toBeInTheDocument()
    })
  })

  it('adds a new server when add server button is clicked', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    mockGetSettingsAction.mockResolvedValueOnce('localhost')
    mockGetSettingsAction.mockResolvedValueOnce(8080)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Manage Servers')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTitle('settings.addServer'))
  })

  it('handles server change correctly', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    mockGetSettingsAction.mockResolvedValueOnce([{ HOST: 'localhost', PORT: 8080 }])
    mockGetSettingsAction.mockResolvedValueOnce('influxHost')
    mockGetSettingsAction.mockResolvedValueOnce('influxToken')
    mockGetSettingsAction.mockResolvedValueOnce('influxOrg')
    mockGetSettingsAction.mockResolvedValueOnce('influxBucket')

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Manage Servers')).toBeInTheDocument()
    })

    const serverInput = screen.getByDisplayValue('localhost')
    fireEvent.change(serverInput, { target: { value: 'newhost' } })

    await waitFor(() => {
      expect(screen.getByDisplayValue('newhost')).toBeInTheDocument()
    })
  })
})
