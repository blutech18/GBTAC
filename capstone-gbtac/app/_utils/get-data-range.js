async function getNewest(){
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphs/newest`, {credentials: "include"});
    const data = await res.json()
    return data
}

async function getOldest(){
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphs/oldest`, {credentials: "include"});
    const data = await res.json()
    return data
}

async function getForecastRange(){
    const newest = await getNewest()
    let date = new Date(newest.replace(/-/g, '/'))
    date.setDate(date.getDate() + 7) // add seven days 
    
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
}

export async function getDataRange(){
    return {
        newest: await getNewest(),
        oldest: await getOldest(),
        forecast: await getForecastRange()
    }
}