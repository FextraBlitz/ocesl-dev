import { defineContentConfig, defineCollection } from '@nuxt/content'
import * as v from 'valibot'

import {ReportSchema} from './app/utils/schemas'

export default defineContentConfig({
  collections: {
    reports: defineCollection({
      type: 'page',
      source: 'reports/**/*.md',
      schema: ReportSchema
    })
  }
})
