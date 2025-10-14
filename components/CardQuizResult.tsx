import { View, Text } from 'react-native'
import React from 'react'
import { QuizData } from '@/app/(home)/(multipleChoiceQuiz)/main'

interface CardQuizResultProps {
  data: QuizData
}

const CardQuizResult = ({ data }: CardQuizResultProps) => {
  const { id, quiz, score, total, type, date } = data

  // Calculate percentage based on score and total
  const percentage = Math.round((score / total) * 100)

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  const getRemarks = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent Performance'
    if (percentage >= 80) return 'Strong Performance'
    if (percentage >= 70) return 'Average Performance'
    if (percentage >= 60) return 'Needs Improvement'
    return 'Failed'
  }

  const grade = getGrade(percentage)
  const remarks = getRemarks(percentage)

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500'
      case 'B':
        return 'bg-blue-500'
      case 'C':
        return 'bg-yellow-500'
      case 'D':
        return 'bg-orange-500'
      default:
        return 'bg-red-500'
    }
  }

  const getRemarkColor = (remarks: string) => {
    if (remarks.toLowerCase().includes('excellent') || remarks.toLowerCase().includes('strong')) {
      return 'text-green-600'
    } else if (remarks.toLowerCase().includes('average')) {
      return 'text-yellow-600'
    } else if (remarks.toLowerCase().includes('improvement') || remarks.toLowerCase().includes('failed')) {
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  return (
    <View className="bg-white/80 rounded-xl shadow-md flex-row border border-gray-200 items-center justify-between p-4 flex-1">
      {/* Left Section - Score and Grade */}
      <View className="flex-row items-center gap-3 flex-1">
        {/* Grade Badge */}
        <View className={`${getGradeColor(grade)} rounded-lg w-14 h-14 justify-center items-center`}>
          <Text className="text-white text-2xl font-bold">
            {grade}
          </Text>
        </View>

        {/* Score and Details */}
        <View className="flex-1">
          <View className="flex-row items-baseline gap-2 mb-1">
            <Text className="text-lg font-bold text-gray-800">
              {score}/{total}
            </Text>
            <Text className="text-sm text-gray-500">
              {percentage}%
            </Text>
          </View>
          <Text className={`text-xs font-semibold ${getRemarkColor(remarks)}`}>
            {remarks}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {type}
          </Text>
        </View>
      </View>

      {/* Right Section - Date */}
      <Text className="text-xs text-gray-500 font-medium ml-2">
        {date}
      </Text>
    </View>
  )
}

export default CardQuizResult