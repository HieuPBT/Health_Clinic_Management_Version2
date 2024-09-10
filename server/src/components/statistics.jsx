import React from 'react'
import { Box, H2, Text, Chart } from '@adminjs/design-system'
import { useTranslation } from 'adminjs'

const Statistics = () => {
  const { translateMessage } = useTranslation()
  const [appointmentCounts, setAppointmentCounts] = React.useState([])

  React.useEffect(() => {
    // Fetch data when component mounts
    fetch('/admin/api/statistics')
      .then(res => res.json())
      .then(data => {
        setAppointmentCounts(data.appointmentCounts)
      })
      .catch(error => console.error('Error fetching appointment counts:', error))
  }, [])

  return (
    <Box variant="grey">
      <Box variant="white">
        <H2>{translateMessage('Thống kê cuộc hẹn')}</H2>
        <Text>{translateMessage('Số lượng cuộc hẹn trong 30 ngày tới')}</Text>
        <Box height={400}>
          {appointmentCounts.length > 0 ? (
            <Chart
              series={[
                {
                  name: translateMessage('Số lượng cuộc hẹn'),
                  data: appointmentCounts.map(item => item.count)
                }
              ]}
              xaxis={{
                categories: appointmentCounts.map(item => item.date)
              }}
              type="line"
            />
          ) : (
            <Text>{translateMessage('Đang tải dữ liệu...')}</Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Statistics
