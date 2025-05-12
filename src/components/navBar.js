"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa1hNhxfP_hC-rq3ZchlNzgo1DiIWrmrWBHg&s"
            alt=""
            className="w-10 h-10"
          />
        </div>
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">
              Hello, {session.user.name.split(" ")[0]}
            </span>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.479c-0.229,1.239-0.896,2.319-1.884,3.159c-0.988,0.84-2.271,1.281-3.775,1.281 c-2.948,0-5.479-2.063-6.073-4.976c-0.131-0.656-0.197-1.328-0.197-2.007s0.066-1.351,0.197-2.007 c0.594-2.913,3.125-4.976,6.073-4.976c1.404,0,2.667,0.441,3.655,1.281l2.771-2.771c-1.689-1.5-3.908-2.319-6.426-2.319 c-5.082,0-9.197,4.115-9.197,9.197s4.115,9.197,9.197,9.197c4.688,0,8.573-3.479,9.099-8.021h-9.959V10.239z" />
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </nav>
  );
}
