import { useState, useEffect } from "react";

const SUPABASE_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

type User = {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

export default function Pcvina() {
    const [users, setUsers] = useState<User[]>([])

    const fetchUsers = async () => {
        try{
            const [res] = await Promise.all([
                fetch(`${SUPABASE_URL}/rest/v1/users?select=id,nick,email,created_at&order=created_at.desc`),
            ]);
            const resg = res.ok ? await res.json() : [];

            setUsers(resg.map);
        } finally {
        }
    }

    return(
        <main className="flex flex-col w-full h-fit bg-red-300 p-4">
            <div className=" bg-blue-400 ">
                
            </div>
        </main>
    )
}