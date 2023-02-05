let tableBody = document.getElementById('tableBody') // таблица
let pagination = document.getElementById('pages') // пагинация
let count = document.getElementById('count_items') // выпадающее меняю с кол-ом отображаемых итемов
let sortBy = document.getElementById('sort')  // выпадающее меняю с категориями

let itemList = fetch('https://dummyjson.com/products') // Делаем fetch-запрос на сервер
   .then(response => response.json()) 
   .then(response => { // получаем массив объектов

      let tableItems = JSON.parse(JSON.stringify(response)) // Делаем копию массива, чтобы не менять исходные данные

      function renderTable(countOfItems = 10, items = tableItems.products, page = 1) { // Функция, определяющая количество итемов в таблице, отображаемый массив
         tableBody.innerHTML = ''
         for (let i = 0; i < countOfItems; i++) {
            tableBody.insertAdjacentHTML('beforeend', `<div class='item' id=${items[i + page * countOfItems - countOfItems].id}>${items[i + page * countOfItems - countOfItems].title}</div>`) // Создаем внутри тела таблицы отдельные 
         }
      }

      renderTable() // Рисуем таблицу
      setPagination() // покаываем пагинацию

      tableBody.addEventListener('mouseover', event => {  // Делегирование события наведения курсова на тело таблицы
         if (event.target.classList.contains('item') && event.relatedTarget) { // Проверяем что наводка произошла именно на нужный итем
            showTip(event.target, tableItems) // Вызываем функцию, показывающую подсказку справа event.target, данные из которой берутся по id из tableItems, прокидываем tableItems 
         }
      })

      tableBody.addEventListener('mousedown', event => { // Делигируем на родителя событие клика
         if (event.target.classList.contains('item')) { // проверяем что таргет является нужным нам элементом
            dragndrop(event.target, tableItems, event) // Вызываем функцию, отвечающую за перетаскивание элементов
         }
      })

      tableBody.addEventListener('mouseout', event => { // Функция, которая вызывается при покидании итема курсосром, и удаляет подсказку
         if (event.target.classList.contains('item')) {
            event.target.style.position = ''
            removeTip(event.target)
         }
      })

      count.addEventListener('change', event => { // функция, которая вызывается при изменении количества показываемых итемов в таблице и перерисовывает таблицу и пагинацию
         tableBody.innerHTML = ''
         setPagination()
         renderTable(count.value)
      })

      sortBy.addEventListener('change', event => {  // Функция, которая сортирует таблицу по выбранному фильтру

         if (document.querySelector('.picked')) document.querySelector('.picked').classList.remove('picked') // при изменении фильтра таблица открывается с первой страницы
         if (document.querySelector('.paginationSpan'))  document.querySelector('.paginationSpan').classList.add('picked')

         switch (sortBy.value) {
            case 'Price-low': {
               tableBody.innerHTML = ''
               let x = tableItems.products.sort((a, b) => a.price - b.price)
               return renderTable(count.value, x)
            }
            case 'Price-hight': {
               tableBody.innerHTML = ''
               let x = tableItems.products.sort((a, b) => b.price - a.price)
               return renderTable(count.value, x)
            }
            case 'Brand': {
               tableBody.innerHTML = ''
               let x = tableItems.products.sort((a, b) => a.brand.localeCompare(b.brand))
               return renderTable(count.value, x)
            }
            case 'Rating-low': {
               tableBody.innerHTML = ''
               let x = tableItems.products.sort((a, b) => a.rating - b.rating)
               return renderTable(count.value, x)
            }
            case 'Rating-hight': {
               tableBody.innerHTML = ''
               let x = tableItems.products.sort((a, b) => b.rating - a.rating)
               return renderTable(count.value, x)
            }
            case 'Category': {
               tableBody.innerHTML = ''
               let x = tableItems.products.sort((a, b) => a.category.localeCompare(b.category))
               return renderTable(count.value, x)
            }
         }
      })

      pagination.addEventListener('click', event => { // Здесь записана логика того, что единовременно может быть выбрана только одна страница
         if (document.querySelector('.picked') && event.target.classList.contains('paginationSpan')) { 
            document.querySelector('.picked').classList.remove('picked')
         } 
         if (event.target.classList.contains('paginationSpan')) {
            event.target.classList.add('picked')
            let currentPage = event.target.textContent
            renderTable(count.value, tableItems.products, currentPage) // Рисуем таблицу исходя из выбранной страницы
         }
      })

      function setPagination() { // Функция, отображающая количество страниц исходя из количества показанных итемов в таблице
         pagination.innerHTML = ''
         for (let page = 1; page <= Math.ceil(tableItems.products.length / count.value); page++) {
            document.getElementById('pages').insertAdjacentHTML('beforeend', `<span class='paginationSpan'>${page}</span>`)
         }
      }

   })

function findById(list, id) { // Функция, которая ищет пользователя с id в списке list, и возвращает этого пользователя
   let item = list.products.find(elem => elem.id === Number(id))
   if (item) return item
}


function showTip(item, tableItems) { // Функция, показывающая подсказку при наведении курсора на итем
   item.style.position = 'relative'
   let description = document.createElement('div')
   description.classList.add('tip')

   let product = findById(tableItems, item.id)

   description.insertAdjacentHTML('afterbegin', `<div>
      <div class ='tipItem' >
         <span class='tipSpan'>Brand: </span> 
         <div>${product.brand}</div>
      </div>
      <div class ='tipItem'>
         <span class='tipSpan'>Category: </span>
         <div>${product.category}</div>
      </div>
      <div class ='tipItem'>
      <span class='tipSpan'>Description: </span> 
      <div>${product.description}</div>
      </div>
      <div class ='tipItem'>
         <span class='tipSpan'>Price: ${product.price}$</span> 
         <span class='tipSpan'>Rating: ${product.rating}</span> 
      </div>
   </div>`) 
   let bottomScroll = document.documentElement.scrollTop + document.documentElement.clientHeight - (tableBody.offsetTop+tableBody.offsetHeight) // Расстояние от низа экрана до нижней части таблицы
   item.insertAdjacentElement('beforeend', description)

   if (description.offsetHeight>tableBody.offsetHeight - item.offsetTop + bottomScroll) { // Здесь прописана логика того, чтобы описание не уходило за пределы видимой части, 
      // если юзер наводит курсор на самый нижний элемент, подсказка которого больше, чем расстояние от элемента до самого низа странцы
      description.style.top = -(description.offsetHeight  - (tableBody.offsetHeight - item.offsetTop + bottomScroll -5 ) ) +'px'
   }

}

function removeTip(eventTarget) { // функция, удаляющая подсказку
   if (eventTarget.querySelector('.tip')) {
      eventTarget.removeChild(eventTarget.querySelector('.tip'))
   }
}

function dragndrop(element, tableItems, event) { // Общая функция по перемещению объектов внутри таблицы

   removeTip(element)  // Удаляем подсказку
   let elemCopy = element.cloneNode() // Делаем клона нашего dragble итема для визуализации его перемещения
   element.classList.add('disabled') // исходному итему задаем выделение
   elemCopy.innerHTML = element.textContent
   elemCopy.classList.add('itemDrag')
   elemCopy.classList.remove('item')
   elemCopy.style.position = 'absolute'
   elemCopy.style.zIndex = '100'
   tableBody.insertAdjacentElement('beforeend', elemCopy)
   move(event.pageX, event.pageY)

   function move(pageX, pageY) { // Функция, отвечающая непосредственно за перемещение объекта на экране

      let currentItemID = null; // переменная, хранящая id итема над которым мы тащим предмет

      function setCurrentItemID(id) {  //Функция, показывающая ID элемента над которым сейчас тянем другой итем.
         if (id === 'tableBody' || !id) return
         if (!Number(currentItemID)) {
            currentItemID = +id
         } else if (+currentItemID === +id) {
            return
         }
         currentItemID = id
         return currentItemID
      }

      elemCopy.hidden = true // Смотрим над каким элементом мы сейчас находимся, если не написать данную строку, то курсор всегда будет находиться над предметом который мы тащим
      let currentItem = findById(tableItems, setCurrentItemID(document.elementsFromPoint(pageX, pageY-window.scrollY)[0].id)) // Ищем по ID в нашем списке элементов

      if (currentItem) {
         document.getElementById(currentItem.id).insertAdjacentElement('afterend', element) // вставляем перетаскиваемый объект после того, над которым мы тащим копию перетаскиваемого объекта. Визуализация перетаскивания
      }
      setCurrentItemID(document.elementsFromPoint(pageX, pageY-window.scrollY)[0].id) // берем самый глубоковложенный элемент по координатам Х и Y
      elemCopy.hidden = false
      elemCopy.style.left = 0 + 'px' // Ограничение движения итема по горизонтали
      elemCopy.style.top = element.offsetTop- window.scrollY - element.getBoundingClientRect().y + pageY - element.offsetHeight / 2 + 'px' // логика движения итема по вертикали
   }

   function mouseMove(event) { // оборачиваем функцию move в другую функцию, для того чтобы потом ее можно было удалить через removeEventListener
      move(event.pageX, event.pageY)
   }
   document.addEventListener('mousemove', mouseMove)

   document.addEventListener('mouseup', () => { //При отпускании ЛКМ у нас удаляется копия, и исходный перетаскиваемый элемент снимает с себя выделение 
      elemCopy.style.zIndex = 0
      elemCopy.remove()
      if (event.target.classList.contains('itemDrag') || event.target.classList.contains('item')) {
         document.removeEventListener('mousemove', mouseMove) // удаляем событие mousemove 
         element.classList.remove('disabled')
      }
   })

}









