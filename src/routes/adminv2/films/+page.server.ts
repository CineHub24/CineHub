import type { Actions } from './$types';
import { error } from '@sveltejs/kit';

export const actions = {
    
    search: async ({request}) => {
        const formdata =  await request.formData();
        const query = formdata.get("query");

        if (!query) throw error(400,"Query is required");

        
        try {
            const res = await fetch(`http://www.omdbapi.com/?apikey=b97fe887&s=${query}`);
            const data = await res.json();
            console.log(data)
            return {
              movies: data.Search
            };
        } catch(e) {
            throw error(500, "API")
        }
        
        

    },
    save: async (event) => {
        console.log("save")
    }
    
} satisfies Actions;



export const load = async (event) => {
   
    return{
        movies: actions.search(event)
    }

  };

// export const load = async() => {


//     const fetchMovies = async() =>{
//         const res  = await fetch("http://www.omdbapi.com/?apikey=b97fe887&s=barbie")
//         const data = await res.json() as {Search: Movie[]}
//         // console.log(data)
//         return data.Search
//     }

//     return{
//         movies: fetchMovies()
//     }
// };