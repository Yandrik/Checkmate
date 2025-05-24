import { Apity } from '@cocreators-ee/apity'
import type { paths } from '@/lib/backend-api'

const apity = Apity.for<paths>()

// global configuration
apity.configure({
  // Base URL to your API
  baseUrl: 'https://petstore.swagger.io/v2',
  // RequestInit options, e.g. default headers
  init: {
    // mode: 'cors'
    // headers: {}
  },
})

// create fetch operations

export const factcheck = apity
    .path('/factcheck')
    .method('post')
    .create()
