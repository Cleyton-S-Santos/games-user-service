import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDTO } from './dto/UserRegister.dto';
import { UserLoginDTO } from './dto/UserLogin.dto';
import { hashPassword, verifyPassword } from '../helper/password.helper';

// Mock para hashPassword e verifyPassword
jest.mock('../helper/password.helper', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

describe('AuthService', () => {
  let authService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    // Cria mocks para userRepository e jwtService
    userRepository = {
      save: jest.fn(),
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'USER_REPOSITORY',
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    authService = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const registerDto: UserRegisterDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      // Ajusta a estrutura para corresponder à entidade User
      (hashPassword as jest.Mock).mockReturnValue('hashedPassword');
      userRepository.save.mockResolvedValue({
        id: 1,  // Adiciona o ID para corresponder ao tipo esperado
        name: registerDto.username,
        email: registerDto.email,
        passwordHash: 'hashedPassword',
      } as User);

      const result = await authService.regiter(registerDto);

      expect(result).toEqual({
        id: 1,
        name: registerDto.username,
        email: registerDto.email,
        passwordHash: 'hashedPassword',
      });
    });

    it('should handle duplicate email error', async () => {
      const registerDto: UserRegisterDTO = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      (hashPassword as jest.Mock).mockReturnValue('hashedPassword');
      userRepository.save.mockRejectedValue({
        driverError: { code: 'ER_DUP_ENTRY' },
      });

      const result = await authService.regiter(registerDto);

      expect(result).toEqual({ err: 'email já registrado' });
    });
  });

  describe('login', () => {
    it('should return an access token for valid login', async () => {
      const loginDto: UserLoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 1,
        name: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      } as User;

      userRepository.findOneBy.mockResolvedValue(user);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('accessToken');

      const result = await authService.login(loginDto);

      expect(result).toEqual({ access_token: 'accessToken' });
    });

    it('should return an error if user is not found', async () => {
      const loginDto: UserLoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      };

      userRepository.findOneBy.mockResolvedValue(null);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ err: 'Usuario não encontrado' });
    });

    it('should return an error if password is invalid', async () => {
      const loginDto: UserLoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 1,
        name: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      } as User;

      userRepository.findOneBy.mockResolvedValue(user);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ err: 'Senha invalida' });
    });
  });
});
