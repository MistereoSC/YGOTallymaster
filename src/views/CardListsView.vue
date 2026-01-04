<script lang='ts' setup>
import {onMounted, ref} from 'vue'
import {getFullCardList, _find} from '@/composables/useCardSearch'
import { TCardData } from '@/libs/interfaces/YGOProInterfaces'

const cardList = ref([] as TCardData[])
onMounted(async ()=>{
    const cards = await getFullCardList()
    const stapleCards = _find.Staples(cards)
    cardList.value = stapleCards
})

</script>

<template>
    <div>
        <h3>Card List</h3>
        <ul>
            <li v-for="card in cardList" :key="card.id">{{ card.name }}</li>
        </ul>
    </div>
</template>


<style lang="scss" scoped>
    
</style>
