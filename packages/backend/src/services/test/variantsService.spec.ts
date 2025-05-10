import { ObjectId } from 'mongodb';
import { getAllVariants } from '../variantsService';
import { repertoireMockData } from '../../mockData/repertoires.mocks';
import { variantsInfoMock } from '../../mockData/variantsInfo.mocks';
import * as mongo from '../../db/mongo';
import * as commonLib from '@chess-opening-master/common';

jest.mock('../../db/mongo', () => {
  const mockDB = {
    collection: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([])
  };
  return {
    connectDB: jest.fn().mockResolvedValue({}),
    getDB: jest.fn().mockReturnValue(mockDB)
  };
});

jest.mock('@chess-opening-master/common', () => {
  const original = jest.requireActual('@chess-opening-master/common');
  return {
    ...original,
    MoveVariantNode: {
      ...original.MoveVariantNode,
      initMoveVariantNode: jest.fn().mockReturnValue({
        getVariants: jest.fn().mockReturnValue([
          { fullName: 'Gambito escocés (4. ...Bc5 9. ...d6)' },
          { fullName: 'Apertura Española (Variante cerrada)' }
        ])
      })
    }
  };
});

describe('variantsService', () => {
  interface MockDB {
    collection: jest.Mock;
    find: jest.Mock;
    toArray: jest.Mock;
  }
  
  let mockDB: MockDB;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDB = {
      collection: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn()
    };

    (mongo.getDB as jest.Mock).mockReturnValue(mockDB);
  });

  describe('getAllVariants', () => {
    it('should return empty arrays if no repertoires are found', async () => {
      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'repertoires') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([])
            })
          };
        }
        if (collectionName === 'variantsInfo') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([])
            })
          };
        }
        return mockDB;
      });

      const result = await getAllVariants();
      
      expect(result.newVariants).toEqual([]);
      expect(result.studiedVariants).toEqual([]);
      expect(mockDB.collection).toHaveBeenCalledWith('repertoires');
      expect(mockDB.collection).toHaveBeenCalledWith('variantsInfo');
    });

    it('should categorize variants correctly between new and studied', async () => {
      const repertoireId = '6444e7b3d9f33ea3203dd157';
      const variantInfoId = '675204d95abbd47059d2f101';
      
      const mockRepertoireData = { 
        ...repertoireMockData, 
        _id: new ObjectId(repertoireId), 
        moveNodes: repertoireMockData.moveNodes 
      };
      
      const mockVariantsInfoData = { 
        ...variantsInfoMock, 
        _id: new ObjectId(variantInfoId),
        variantName: 'Gambito escocés (4. ...Bc5 9. ...d6)'
      };

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'repertoires') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockRepertoireData])
            })
          };
        }
        if (collectionName === 'variantsInfo') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockVariantsInfoData])
            })
          };
        }
        return mockDB;
      });

      const mockGetVariants = jest.fn().mockReturnValue([
        { fullName: 'Gambito escocés (4. ...Bc5 9. ...d6)' },
        { fullName: 'Apertura Española (Variante cerrada)' }
      ]);
      
      const mockInitMoveVariantNode = (commonLib.MoveVariantNode.initMoveVariantNode as jest.Mock);
      mockInitMoveVariantNode.mockReturnValue({
        getVariants: mockGetVariants
      });

      const result = await getAllVariants();
      
      expect(result.studiedVariants).toHaveLength(1);
      expect(result.studiedVariants[0].name).toBe('Gambito escocés (4. ...Bc5 9. ...d6)');
      expect(result.studiedVariants[0].repertoireId).toBe(repertoireId);
      
      expect(result.newVariants).toHaveLength(1);
      expect(result.newVariants[0].name).toBe('Apertura Española (Variante cerrada)');
      expect(result.newVariants[0].repertoireId).toBe(repertoireId);
    });

    it('should skip disabled repertoires', async () => {
      const variantInfoId = '675204d95abbd47059d2f101';

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'repertoires') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([])
            })
          };
        }
        if (collectionName === 'variantsInfo') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([{
                ...variantsInfoMock,
                _id: new ObjectId(variantInfoId),
                variantName: 'Gambito escocés (4. ...Bc5 9. ...d6)'
              }])
            })
          };
        }
        return mockDB;
      });

      const result = await getAllVariants();
      
      expect(result.studiedVariants).toHaveLength(0);
      expect(result.newVariants).toHaveLength(0);
    });

    it('should handle repertoires without moveNodes', async () => {
      const repertoireId = '6444e7b3d9f33ea3203dd157';
      const variantInfoId = '675204d95abbd47059d2f101';
      
      const mockRepertoireWithoutMoveNodes = { 
        ...repertoireMockData, 
        _id: new ObjectId(repertoireId), 
        moveNodes: undefined 
      };
      
      const mockVariantsInfoData = { 
        ...variantsInfoMock, 
        _id: new ObjectId(variantInfoId),
        variantName: 'Gambito escocés (4. ...Bc5 9. ...d6)'
      };

      mockDB.collection.mockImplementation((collectionName: string) => {
        if (collectionName === 'repertoires') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockRepertoireWithoutMoveNodes])
            })
          };
        }
        if (collectionName === 'variantsInfo') {
          return {
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([mockVariantsInfoData])
            })
          };
        }
        return mockDB;
      });

      const result = await getAllVariants();
      
      expect(result.studiedVariants).toHaveLength(0);
      expect(result.newVariants).toHaveLength(0);
    });
  });
});