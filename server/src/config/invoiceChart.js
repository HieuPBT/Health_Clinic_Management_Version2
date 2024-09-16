import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Box } from '@adminjs/design-system'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const InvoiceChart = (props) => {
  const { chartData } = props

  return (
    <Box variant="white">
      <h1>Invoice Chart</h1>
      <Bar data={JSON.parse(chartData)} />
    </Box>
  )
}

export default InvoiceChart