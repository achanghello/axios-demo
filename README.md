## Axios 封装

### 项目结构

```
src/api/
├── config/         # 配置文件
├── enums/          # 枚举定义
├── hooks/          # 自定义hooks
├── interface/      # TypeScript接口定义
├── utils/          # 工具函数
└── index.ts        # 主要封装实现
```

### 实现思路

#### 1. 基础配置
- 基于 TypeScript 实现，提供完整的类型支持
- 使用类的方式封装，更好的代码组织和扩展性
- 支持自定义配置：baseURL、timeout、重试次数等

#### 2. 核心功能

##### 请求拦截器
- 防重复请求控制
- 统一的 loading 处理
- 请求头统一配置（token等）

##### 响应拦截器
- 统一的错误码处理
- 登录失效处理
- 请求重试机制

##### 请求方法封装
- 支持 GET、POST、PUT 等常用请求方法
- 泛型支持，提供准确的类型提示
- 灵活的配置项支持

#### 3. 特色功能
- 请求重试：可配置重试次数和延迟时间
- 请求取消：基于 axios 的 cancelToken 实现
- 类型安全：完整的 TypeScript 类型支持

#### 4. 使用示例

```typescript
// GET 请求
const data = await http.get<API.Response>('/api/users', { page: 1 });

// POST 请求
const result = await http.post<API.Response>('/api/user', {
  name: 'John',
  age: 18
});

// 带配置的请求
const result = await http.get('/api/data', null, {
  loading: false,  // 禁用loading
  cancel: false,   // 禁用重复请求取消
  retryCount: 3    // 设置重试次数
});
