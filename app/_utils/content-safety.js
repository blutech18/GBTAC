export async function checkSafety(text){
    if(text.length > 0){
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/safety?text=${text}`, {credentials: "include"});
        const data = await res.json()
        console.log(data)
    
        let pass = true
    
        data.forEach(cat => {
            if(cat.severity > 0) pass = false
        });
        console.log("pass: " + pass)
        return pass
    }
    return true
}