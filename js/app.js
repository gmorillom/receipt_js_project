function main(){
    const categoriaSelect = document.querySelector('#categorias')
    
    if(categoriaSelect){
        categoriaSelect.addEventListener('change',seleccionarCategoria,false)
        obtenerCategorias()
    }

    
    const resultado = document.querySelector('#resultado')
    const favoritosDiv = document.querySelector('.favoritos')

    if( favoritosDiv ){
        obtenerFavoritos()
    }

    const modal = new bootstrap.Modal('#modal',{})


    function obtenerCategorias(){
        const apikey = `https://www.themealdb.com/api/json/v1/1/categories.php`
    
        fetch(apikey)
        .then( respuesta => respuesta.json() )
        .then( data => {
            mostrarCategorias(data.categories)
        } )
    }
    
    
    function mostrarCategorias(categorias){

        categorias.forEach( categoria => {
            const optionSelect = document.createElement('option')
            optionSelect.value = categoria.strCategory
            optionSelect.textContent = categoria.strCategory

            categoriaSelect.appendChild(optionSelect)

        } )
    }

    function seleccionarCategoria(e){
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`

        fetch(url)
        .then( respuesta => respuesta.json() )
        .then( data => mostrarRecetas(data.meals) )

    }

    function mostrarRecetas(comidas = []){
        limpiarHTML(resultado)

        const resultadoHeading = document.createElement('h3')
        resultadoHeading.classList.add('text-center','mb-5')
        resultadoHeading.textContent = `${comidas.length} recetas`

        resultado.appendChild(resultadoHeading)

        comidas.forEach( comida => {
            const {idMeal, strMeal, strMealThumb} = comida
            const recetaContainer = document.createElement('div')
            recetaContainer.classList.add('col-md-4')

            const recetaCard = document.createElement('div')
            recetaCard.classList.add('card','mb-4')

            const recetaImagen = document.createElement('img')
            recetaImagen.classList.add('card-img-top')
            recetaImagen.src = strMealThumb ?? comida.photo
            recetaImagen.alt = `Imagen de la receta ${strMeal}` ?? `Imagen de la receta ${comida.title}`
            recetaImagen.loading = 'lazy'

            const recetaCardBody = document.createElement('div')
            recetaCardBody.classList.add('card-body')

            const recetaHeading = document.createElement('h3')
            recetaHeading.classList.add('card-title','mb-3')
            recetaHeading.textContent = strMeal ?? comida.title

            const recetaButton = document.createElement('button')
            recetaButton.classList.add('btn','btn-danger','w-100')
            recetaButton.textContent = 'Ver receta'
            recetaButton.onclick = function (){
                seleccionarReceta(idMeal ?? comida.id)
            }
            recetaButton.dataset.bsTarget = '#modal'
            recetaButton.dataset.bsToggle = 'modal'



            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)

            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)

            recetaContainer.appendChild(recetaCard)

            resultado.appendChild(recetaContainer)

        } )

    }

    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`

        fetch(url)
        .then( respuesta => respuesta.json() )
        .then( data => mostrarRecetaModal(data.meals[0]) )

    }

    function mostrarRecetaModal(receta){
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta 

        const modalTitle = document.querySelector('.modal .modal-title')
        const modalBody = document.querySelector('.modal .modal-body')

        modalTitle.textContent = strMeal
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="Receta ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p class="text-justify">${strInstructions}</p>
            <h3 class="my-3">Ingredientes</h3>
        `

        const listGroup = document.createElement('ul')
        listGroup.classList.add('list-group')

        for( let i=1; i <= 20; ++i  ){
            if( receta[`strIngredient${i}`] ){
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`] 
                const ingredienteLi = document.createElement('li')

                ingredienteLi.classList.add('list-group-item')
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLi)

            }
        }

        modalBody.appendChild(listGroup)
        const modalFooter = document.querySelector('.modal-footer')
        limpiarHTML(modalFooter)

        const btnFavoritos = document.createElement('button')
        btnFavoritos.classList.add('btn','btn-danger','col')
        btnFavoritos.textContent = existeFavorito(idMeal) ? 'Eliminar favorito' : 'Guardar favorito'
        btnFavoritos.onclick = function(){
            agregarFavorito({
                id:idMeal,
                title: strMeal,
                photo: strMealThumb
            },btnFavoritos)
        }

        const btnCerrar = document.createElement('button')
        btnCerrar.classList.add('btn','btn-secondary','col')
        btnCerrar.textContent = 'Cerrar'
        btnCerrar.onclick = function(){
            modal.hide()
        }


        modalFooter.appendChild(btnFavoritos)
        modalFooter.appendChild(btnCerrar)

        modal.show()
    }

    function limpiarHTML(elem){
        while( elem.firstChild ) elem.removeChild(elem.firstChild)
    }

    function agregarFavorito(receta,btnFavoritos){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        
        if( existeFavorito(receta.id) ){
            eliminarFavorito(receta.id)
            btnFavoritos.textContent = 'Guardar favorito'
            mostrarToast('Se ha eliminado un favorito')
            return
        } 
            
        localStorage.setItem('favoritos',JSON.stringify([...favoritos,receta]))
        btnFavoritos.textContent = 'Eliminar favorito'
        mostrarToast('Se ha guardado un favorito')
    }

    function existeFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        return favoritos.some(favorito => favorito.id == id)
    }

    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        const favoritosFiltrados = favoritos.filter(favorito => favorito.id !== id)
        localStorage.setItem('favoritos',JSON.stringify(favoritosFiltrados))
    }

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast')
        const toastBody = document.querySelector('.toast-body')
        const toast = new bootstrap.Toast(toastDiv)
        toastBody.textContent = mensaje
        toast.show()

    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []

        if( favoritos.length){
            mostrarRecetas(favoritos)
        }
    }

}




document.addEventListener('DOMContentLoaded',main,false)