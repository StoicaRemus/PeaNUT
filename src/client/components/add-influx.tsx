import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { ThemeContext } from '@/client/context/theme'
import { LanguageContext } from '@/client/context/language'
import { Button, Input } from '@material-tailwind/react'

type AddInfluxProps = {
  initialValues: { server: string; token: string; org: string; bucket: string }
  handleChange: (server: string, token: string, org: string, bucket: string) => void
  testInfluxConnectionAction: (server: string, token: string, org: string, bucket: string) => Promise<void>
}

export default function AddInflux({ initialValues, handleChange, testInfluxConnectionAction }: AddInfluxProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useContext(ThemeContext)
  const [server, setServer] = useState<string>(initialValues.server)
  const [token, setToken] = useState<string>(initialValues.token)
  const [org, setOrg] = useState<string>(initialValues.org)
  const [bucket, setBucket] = useState<string>(initialValues.bucket)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [connecting, setConnecting] = useState<boolean>(false)

  const toggleShowPassword = () => setShowPassword(!showPassword)

  const handleTestConnection = async () => {
    if (server && token) {
      setConnecting(true)
      const promise = testInfluxConnectionAction(server, token, org, bucket)
      toast.promise(promise, {
        pending: t('connect.testing'),
        success: {
          render() {
            setConnecting(false)
            return t('connect.success')
          },
        },
        error: {
          render() {
            setConnecting(false)
            return t('connect.error')
          },
        },
      })
    }
  }

  return (
    <div className='mb-4 mt-1 w-full rounded-lg bg-gray-200 pb-6 pl-6 dark:bg-gray-600'>
      <ToastContainer position='top-center' theme={theme} />
      <div className='pr-6 pt-6'>
        <form className='w-full'>
          <div className='mb-4'>
            <Input
              type='text'
              variant='outlined'
              label={t('connect.server')}
              value={server}
              onChange={(e) => {
                setServer(e.target.value)
                handleChange(e.target.value, token, org, bucket)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='server'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type={showPassword ? 'text' : 'password'}
              icon={
                <Button
                  data-testid='show-password'
                  ripple={false}
                  onClick={toggleShowPassword}
                  className='relative overflow-hidden p-0'
                  variant='text'
                >
                  {showPassword ? (
                    <EyeSlashIcon className='h-6 w-6 stroke-1 dark:text-white' />
                  ) : (
                    <EyeIcon className='h-6 w-6 stroke-1 dark:text-white' />
                  )}
                </Button>
              }
              variant='outlined'
              label={t('connect.token')}
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                handleChange(server, e.target.value, org, bucket)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='token'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type='text'
              variant='outlined'
              label={t('connect.org')}
              value={org}
              onChange={(e) => {
                setOrg(e.target.value)
                handleChange(server, token, e.target.value, bucket)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='org'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type='text'
              variant='outlined'
              label={t('connect.bucket')}
              value={bucket}
              onChange={(e) => {
                setBucket(e.target.value)
                handleChange(server, token, org, e.target.value)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='bucket'
              crossOrigin=''
            />
          </div>
          <div className='flex flex-row justify-between'>
            <div />
            <Button
              disabled={connecting}
              onClick={async () => handleTestConnection()}
              className='bg-red-500 font-bold text-white shadow-none hover:bg-red-700'
              type='button'
            >
              {t('connect.test')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
