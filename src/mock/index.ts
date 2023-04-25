import Mock from 'mockjs'

interface List {
  id: number
  name: string
  address: string
  sex: number
  job: string
}
const list = Mock.mock({
  'peoples|50000': [{
    'id|+1': 1,
    'guid': '@guid',
    'name': '@cname',
    'age': '@integer(20, 50)',
    'birthday': '@date("MM-dd")',
    'address': '@county(true)',
    'email': '@email',
    sex: Mock.Random.integer(0, 1),
    'job|1': ['designer', 'web', 'java', 'testers', 'product'] // 从字符串数组中随机选择
  }]
});
// let list: List[] = []
// const count = 200
// for (let i = 0; i < count; i++) {
//   list.push(Mock.mock({
//     id: '@id',
//     name: '@cname',
//     address: '@county(true)',
//     'birth|315504000000-946656000000': 1,
//     sex: Mock.Random.integer(0, 1),
//     'job|1': ['designer', 'programmer', 'testers', 'product'] // 从字符串数组中随机选择一个数
//   }))
// }
export {
  list
}
