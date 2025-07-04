<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">作り置きを登録</h1>

    <form
      @submit.prevent="addStock"
      class="flex flex-col gap-3"
    >
      <input
        v-model="name"
        type="text"
        placeholder="料理名（例：ラタトゥイユ）"
        class="p-2 border rounded"
        required
      />

      <select
        v-model="storageType"
        class="p-2 border rounded"
        required
      >
        <option
          disabled
          value=""
        >
          保存場所を選択
        </option>
        <option value="冷蔵">冷蔵</option>
        <option value="冷凍">冷凍</option>
        <option value="常温">常温</option>
      </select>

      <input
        v-model.number="durationDays"
        type="number"
        min="1"
        placeholder="保存日数（例：7）"
        class="p-2 border rounded"
        required
      />

      <button
        type="submit"
        class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        登録する
      </button>
    </form>
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">登録済みの作り置き</h2>
      <div
        v-if="stockItems.length === 0"
        class="text-gray-500"
      >
        まだ作り置きが登録されていません
      </div>
      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="item in stockItems"
          :key="item.id"
          class="p-3 border rounded-lg bg-gray-50"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">{{ item.name }}</h3>
              <p class="text-sm text-gray-600">{{ item.storage_type }}</p>
              <p class="text-sm text-gray-600">
                {{ item.duration_days }}日保存
              </p>
            </div>
            <button
              @click="deleteStock(item.id)"
              class="text-red-500 hover:text-red-700 text-sm"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface StockItem {
  id: number
  name: string
  storage_type: string
  duration_days: number
  status: string
  created_at: string
}

const name = ref('')
const storageType = ref('')
const durationDays = ref<number | null>(null)
const stockItems = ref<StockItem[]>([])

const fetchStockItems = async () => {
  const { $supabase } = useNuxtApp()
  console.log('データ取得開始')

  // まず全データを取得してみる
  const { data: allData, error: allError } = await $supabase
    .from('stock_items')
    .select('*')

  console.log('全データ:', allData, 'エラー:', allError)

  // activeのみを取得
  const { data, error } = await $supabase
    .from('stock_items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  console.log('activeデータ:', data, 'エラー:', error)

  if (error) {
    console.error('データ取得エラー:', error)
  } else {
    stockItems.value = data || []
    console.log('stockItems.value設定完了:', stockItems.value)
  }
}

const addStock = async () => {
  const { $supabase } = useNuxtApp()
  console.log('登録開始:', {
    name: name.value,
    storage_type: storageType.value,
    duration_days: durationDays.value,
    status: 'active',
  })

  const { data, error } = await $supabase
    .from('stock_items')
    .insert({
      name: name.value,
      storage_type: storageType.value,
      duration_days: durationDays.value,
      status: 'active',
    })
    .select()

  console.log('登録結果:', data, 'エラー:', error)

  if (error) {
    alert('登録失敗: ' + error.message)
    console.error('詳細エラー:', error)
  } else {
    alert('登録しました！')
    name.value = ''
    storageType.value = ''
    durationDays.value = null
    await fetchStockItems()
  }
}

const deleteStock = async (id: number) => {
  const { $supabase } = useNuxtApp()
  const { error } = await $supabase
    .from('stock_items')
    .update({ status: 'deleted' })
    .eq('id', id)

  if (error) {
    alert('削除失敗: ' + error.message)
  } else {
    await fetchStockItems()
  }
}

onMounted(() => {
  fetchStockItems()
})
</script>
