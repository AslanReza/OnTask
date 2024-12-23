import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdLogOut } from 'react-icons/io'
import { FaTasks } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { GiNinjaHead } from 'react-icons/gi'
import { db } from '../config/firebaseConfig'

// Import Firebase services
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [userInfo, setUserInfo] = useState(null)
  const [taskStats, setTaskStats] = useState({
    created: 0,
    archived: 0,
    completed: 0,
    pending: 0,
  })
  const [activityLog, setActivityLog] = useState([])

  useEffect(() => {
    if (user) {
      // Fetch user data
      fetchUserInfo(user.uid)
      // Fetch task data
      fetchTaskStats(user.uid)
      // Fetch recent activity
      fetchUserActivity(user.uid)
    }
  }, [user])

  const fetchUserInfo = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        setUserInfo(userDoc.data())
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchTaskStats = async (userId) => {
    try {
      const tasksRef = collection(db, 'tasks')
      const tasksQuery = query(tasksRef, where('userId', '==', userId))
      const taskSnapshot = await getDocs(tasksQuery)

      let created = 0
      let archived = 0
      let completed = 0
      let pending = 0

      taskSnapshot.forEach((doc) => {
        const taskData = doc.data()
        created++ // Counting each task
        if (taskData.status === 'archived') {
          archived++ // Archived tasks
        } else if (taskData.status === 'completed') {
          completed++ // Completed tasks
        } else {
          pending++ // Pending tasks (not archived or completed)
        }
      })

      setTaskStats({ created, archived, completed, pending })
    } catch (error) {
      console.error('Error fetching task stats:', error)
    }
  }

  const fetchUserActivity = async (userId) => {
    try {
      const activityRef = collection(db, 'activity')
      const activityQuery = query(activityRef, where('userId', '==', userId))
      const activitySnapshot = await getDocs(activityQuery)

      const activityLog = activitySnapshot.docs.map((doc) => doc.data())
      setActivityLog(activityLog)
    } catch (error) {
      console.error('Error fetching user activity:', error)
    }
  }

  return (
    <div className="bg-neutral-900 text-neutral-200">
      {/* Navigation */}
      <nav className="flex w-full fixed top-0 bg-neutral-800 shadow-md px-4 py-1 text-neutral-100 justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl rubik-80s-fade-regular">
            <span className="text-sm text-green-500">On</span>Task
          </h1>
          <span className="text-neutral-400">|</span>
          <button
            onClick={() => navigate('/tasks')}
            className="text-2xl flex items-center flex-row-reverse gap-2 bg-green-600 rounded-full p-1"
          >
            <span className="text-xs inline-block">Tasks</span>
            <FaTasks />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={logout}
            className="bg-red-500 p-1 text-2xl items-center group flex flex-row gap-1 rounded-full"
          >
            <span className="text-xs group-hover:inline-block hidden">
              Log Out
            </span>
            <IoMdLogOut />
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="mt-[40px] z-0 w-full justify-center items-center flex h-[94vh]">
        <div className="bg-neutral-800 w-full sm:w-[80%] md:w-[50%] h-auto rounded-lg p-4">
          {/* Profile Header */}
          <div className="text-center mb-6 text-2xl">
            <h1>Profile</h1>
          </div>

          {/* Profile Picture and Username */}

          {/* User Info */}
          <div className="flex flex-col items-start gap-2 mb-4">
            <div className="flex justify-between w-full">
              <p className="font-semibold">Email:</p>
              <p>{user?.email || 'Not Provided'}</p>
            </div>
            <div className="flex justify-between w-full">
              <p className="font-semibold">Firebase ID:</p>
              <p>{user?.uid || 'Not Available'}</p>
            </div>
            <div className="flex justify-between w-full">
              <p className="font-semibold">Joined:</p>
              <p>{userInfo?.createdAt || 'N/A'}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="bg-neutral-700 p-[0.5px] my-3 rounded-full"></div>

          {/* Task Overview Section */}
          <div className="flex flex-col mb-4">
            <h2 className="text-lg font-semibold">Task Overview</h2>
            <div className="flex flex-col sm:flex-row text-green-500 justify-between gap-4 mt-2">
              <div className="bg-neutral-700 p-3 rounded-lg w-full text-center">
                <p className="font-semibold">Created</p>
                <p>{taskStats.created}</p>
              </div>
              <div className="bg-neutral-700 p-3 rounded-lg w-full text-center">
                <p className="font-semibold">Completed</p>
                <p>{taskStats.completed}</p>
              </div>
              <div className="bg-neutral-700 p-3 rounded-lg w-full text-center">
                <p className="font-semibold">Pending</p>
                <p>{taskStats.pending}</p>
              </div>
              <div className="bg-neutral-700 p-3 rounded-lg w-full text-center">
                <p className="font-semibold">Archived</p>
                <p>{taskStats.archived}</p>
              </div>
            </div>
          </div>

          {/* Task Details Section */}
          <div className="flex items-start flex-col justify-start mb-4">
            <p className="text-sm">
              You have created <strong>{taskStats.created}</strong> tasks.
            </p>
            <p className="text-sm">
              You have archived <strong>{taskStats.archived}</strong> tasks.
            </p>
            <p className="text-sm">
              You have completed <strong>{taskStats.completed}</strong> tasks.
            </p>
            <p className="text-sm">
              You have <strong>{taskStats.pending}</strong> pending tasks.
            </p>
          </div>

          {/* Divider */}
          <div className="bg-neutral-700 p-[0.5px] my-3 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
