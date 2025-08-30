import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

const users: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    createdAt: new Date('2024-01-02'),
  },
]

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    const newUser: User = {
      id: (users.length + 1).toString(),
      email: createUserDto.email,
      name: createUserDto.name,
      createdAt: new Date(),
    }
    users.push(newUser)
    return newUser
  }

  findAll() {
    return users
  }

  findOne(id: number) {
    return users.find((user) => user.id === id.toString())
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = users.find((user) => user.id === id.toString())
    if (user) {
      Object.assign(user, updateUserDto)
    }
    return user
  }

  remove(id: number) {
    const userIndex = users.findIndex((user) => user.id === id.toString())
    if (userIndex !== -1) {
      users.splice(userIndex, 1)
      return { deleted: true }
    }
    return { deleted: false }
  }
}
