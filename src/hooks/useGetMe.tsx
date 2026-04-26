"use client"

import { AppDispatch } from "@/redux/store"
import { setUserData } from "@/redux/userSlice"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"


const useGetMe = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isDev = process.env.NODE_ENV === "development";
  useEffect(() => {
    const getme = async () => {
      try {
        const res = await axios.get("/api/me");
        dispatch(setUserData(res.data))
      }
      catch (error) {
        if (isDev) console.log(error)
      }
    }
    getme();
  }, [])
  return (
    <div>

    </div>
  )
}

export default useGetMe
