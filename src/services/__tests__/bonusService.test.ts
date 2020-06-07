// tslint:disable: no-duplicate-string no-identical-functions

import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

import { EmailAddress } from "../../../generated/backend/EmailAddress";
import { FiscalCode } from "../../../generated/backend/FiscalCode";
import { SpidLevelEnum } from "../../../generated/backend/SpidLevel";

import { BonusActivationStatusEnum } from "../../../generated/io-bonus-api/BonusActivationStatus";
import { EligibilityCheck } from "../../../generated/io-bonus-api/EligibilityCheck";
import { InstanceId } from "../../../generated/io-bonus-api/InstanceId";
import { MaxBonusAmount } from "../../../generated/io-bonus-api/MaxBonusAmount";
import { MaxBonusTaxBenefit } from "../../../generated/io-bonus-api/MaxBonusTaxBenefit";
import { PaginatedBonusActivationsCollection } from "../../../generated/io-bonus-api/PaginatedBonusActivationsCollection";
import { BonusAPIClient } from "../../clients/bonus";
import { SessionToken, WalletToken } from "../../types/token";
import { User } from "../../types/user";
import BonusService from "../bonusService";

const aValidFiscalCode = "XUZTCT88A51Y311X" as FiscalCode;
const aValidSPIDEmail = "from_spid@example.com" as EmailAddress;
const aValidSpidLevel = SpidLevelEnum["https://www.spid.gov.it/SpidL2"];

const aInstanceId: InstanceId = {
  id: "aInstanceId.id" as NonEmptyString
};

const aBonusId = "aBonusId" as NonEmptyString;

const aEligibilityCheck: EligibilityCheck = {
  family_members: [],
  id: "aEligibilityCheck.id" as NonEmptyString,
  max_amount: 150 as MaxBonusAmount,
  max_tax_benefit: 30 as MaxBonusTaxBenefit,
  // tslint:disable-next-line: no-any
  status: "ELIGIBLE" as any
};

const aPaginatedBonusActivationCollection: PaginatedBonusActivationsCollection = {
  items: [
    {
      id: "itemid" as NonEmptyString,
      is_applicant: true,
      status: BonusActivationStatusEnum.ACTIVE
    }
  ]
};

// mock for a valid User
const mockedUser: User = {
  created_at: 1183518855,
  family_name: "Lusso",
  fiscal_code: aValidFiscalCode,
  name: "Luca",
  session_token: "HexToKen" as SessionToken,
  spid_email: aValidSPIDEmail,
  spid_level: aValidSpidLevel,
  spid_mobile_phone: "3222222222222" as NonEmptyString,
  wallet_token: "HexToKen" as WalletToken
};

const mockGetAllBonusActivations = jest.fn();
const mockGetBonusEligibilityCheck = jest.fn();
const mockGetLatestBonusActivationById = jest.fn();
const mockStartBonusActivationProcedure = jest.fn();
const mockStartBonusEligibilityCheck = jest.fn();

const mockBonusAPIClient = {
  getAllBonusActivations: mockGetAllBonusActivations,
  getBonusEligibilityCheck: mockGetBonusEligibilityCheck,
  getLatestBonusActivationById: mockGetLatestBonusActivationById,
  startBonusActivationProcedure: mockStartBonusActivationProcedure,
  startBonusEligibilityCheck: mockStartBonusEligibilityCheck
} as ReturnType<BonusAPIClient>;

const api = mockBonusAPIClient;

describe("BonusService#startBonusEligibilityCheck", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make the correct api call", async () => {
    const service = new BonusService(api);

    await service.startBonusEligibilityCheck(mockedUser);

    expect(mockStartBonusEligibilityCheck).toHaveBeenCalledWith({
      fiscalCode: mockedUser.fiscal_code
    });
  });

  it("should handle a successful new request", async () => {
    mockStartBonusEligibilityCheck.mockImplementation(() =>
      t.success({
        headers: { Location: "resource-url" },
        status: 201,
        value: aInstanceId
      })
    );

    const service = new BonusService(api);

    const res = await service.startBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseSuccessRedirectToResource"
    });
  });

  it("should handle a pending check response", async () => {
    mockStartBonusEligibilityCheck.mockImplementation(() =>
      t.success({ status: 202 })
    );

    const service = new BonusService(api);

    const res = await service.startBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseSuccessAccepted"
    });
  });

  it("should handle an validation error when the user already has a bonus", async () => {
    mockStartBonusEligibilityCheck.mockImplementation(() =>
      t.success({ status: 403 })
    );

    const service = new BonusService(api);

    const res = await service.startBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorValidation"
    });
  });

  it("should handle an internal error response", async () => {
    const aGenericProblem = {};
    mockStartBonusEligibilityCheck.mockImplementation(() =>
      t.success({ status: 500, value: aGenericProblem })
    );

    const service = new BonusService(api);

    const res = await service.startBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error for unhandled response status code", async () => {
    mockStartBonusEligibilityCheck.mockImplementation(() =>
      t.success({ status: 123 })
    );
    const service = new BonusService(api);

    const res = await service.startBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error if the api call thows", async () => {
    mockStartBonusEligibilityCheck.mockImplementation(() => {
      throw new Error();
    });
    const service = new BonusService(api);

    const res = await service.startBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });
});

describe("BonusService#getBonusEligibilityCheck", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make the correct api call", async () => {
    const service = new BonusService(api);

    await service.getBonusEligibilityCheck(mockedUser);

    expect(mockGetBonusEligibilityCheck).toHaveBeenCalledWith({
      fiscalCode: mockedUser.fiscal_code
    });
  });

  it("should handle a successful request", async () => {
    mockGetBonusEligibilityCheck.mockImplementation(() =>
      t.success({ status: 200, value: aEligibilityCheck })
    );

    const service = new BonusService(api);

    const res = await service.getBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseSuccessJson",
      value: aEligibilityCheck
    });
  });

  it("should handle an internal error response", async () => {
    const aGenericProblem = {};
    mockGetBonusEligibilityCheck.mockImplementation(() =>
      t.success({ status: 500, value: aGenericProblem })
    );

    const service = new BonusService(api);

    const res = await service.getBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error for unhandled response status code", async () => {
    mockGetBonusEligibilityCheck.mockImplementation(() =>
      t.success({ status: 123 })
    );
    const service = new BonusService(api);

    const res = await service.getBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error if the api call thows", async () => {
    mockGetBonusEligibilityCheck.mockImplementation(() => {
      throw new Error();
    });
    const service = new BonusService(api);

    const res = await service.getBonusEligibilityCheck(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });
});

describe("BonusService#getLatestBonusActivationById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make the correct api call", async () => {
    const service = new BonusService(api);

    await service.getLatestBonusActivationById(mockedUser, aBonusId);

    expect(mockGetLatestBonusActivationById).toHaveBeenCalledWith({
      bonus_id: aBonusId,
      fiscalCode: mockedUser.fiscal_code
    });
  });

  it("should handle a successful request", async () => {
    mockGetLatestBonusActivationById.mockImplementation(() =>
      t.success({ status: 200, value: aEligibilityCheck })
    );

    const service = new BonusService(api);

    const res = await service.getLatestBonusActivationById(
      mockedUser,
      aBonusId
    );

    expect(res).toMatchObject({
      kind: "IResponseSuccessJson",
      value: aEligibilityCheck
    });
  });

  it("should handle an internal error response", async () => {
    const aGenericProblem = {};
    mockGetLatestBonusActivationById.mockImplementation(() =>
      t.success({ status: 500, value: aGenericProblem })
    );

    const service = new BonusService(api);

    const res = await service.getLatestBonusActivationById(
      mockedUser,
      aBonusId
    );

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error for unhandled response status code", async () => {
    mockGetLatestBonusActivationById.mockImplementation(() =>
      t.success({ status: 123 })
    );
    const service = new BonusService(api);

    const res = await service.getLatestBonusActivationById(
      mockedUser,
      aBonusId
    );

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error if the api call thows", async () => {
    mockGetLatestBonusActivationById.mockImplementation(() => {
      throw new Error();
    });
    const service = new BonusService(api);

    const res = await service.getLatestBonusActivationById(
      mockedUser,
      aBonusId
    );

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });
});

describe("BonusService#getAllBonusActivations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make the correct api call", async () => {
    const service = new BonusService(api);

    await service.getAllBonusActivations(mockedUser);

    expect(mockGetAllBonusActivations).toHaveBeenCalledWith({
      fiscalCode: mockedUser.fiscal_code
    });
  });

  it("should handle a successful request", async () => {
    mockGetAllBonusActivations.mockImplementation(() =>
      t.success({
        status: 200,
        value: aPaginatedBonusActivationCollection
      })
    );

    const service = new BonusService(api);

    const res = await service.getAllBonusActivations(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseSuccessJson"
    });
  });

  it("should handle no found bonus", async () => {
    mockGetAllBonusActivations.mockImplementation(() =>
      t.success({ status: 404 })
    );

    const service = new BonusService(api);

    const res = await service.getAllBonusActivations(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorNotFound"
    });
  });

  it("should handle an internal error response", async () => {
    const aGenericProblem = {};
    mockGetAllBonusActivations.mockImplementation(() =>
      t.success({ status: 500, value: aGenericProblem })
    );

    const service = new BonusService(api);

    const res = await service.getAllBonusActivations(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error for unhandled response status code", async () => {
    mockGetAllBonusActivations.mockImplementation(() =>
      t.success({ status: 123 })
    );
    const service = new BonusService(api);

    const res = await service.getAllBonusActivations(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error if the api call thows", async () => {
    mockGetAllBonusActivations.mockImplementation(() => {
      throw new Error();
    });
    const service = new BonusService(api);

    const res = await service.getAllBonusActivations(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });
});

describe("BonusService#startBonusActivationProcedure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make the correct api call", async () => {
    const service = new BonusService(api);

    await service.startBonusActivationProcedure(mockedUser);

    expect(mockStartBonusActivationProcedure).toHaveBeenCalledWith({
      fiscalCode: mockedUser.fiscal_code
    });
  });

  it("should handle a successful new request", async () => {
    mockStartBonusActivationProcedure.mockImplementation(() =>
      t.success({
        headers: { Location: "resource-url" },
        status: 201,
        value: aInstanceId
      })
    );

    const service = new BonusService(api);

    const res = await service.startBonusActivationProcedure(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseSuccessRedirectToResource"
    });
  });

  it("should handle a pending check response", async () => {
    mockStartBonusActivationProcedure.mockImplementation(() =>
      t.success({ status: 202 })
    );

    const service = new BonusService(api);

    const res = await service.startBonusActivationProcedure(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseSuccessAccepted"
    });
  });

  it("should handle an error when the user already has a bonus", async () => {
    mockStartBonusActivationProcedure.mockImplementation(() =>
      t.success({ status: 403 })
    );

    const service = new BonusService(api);

    const res = await service.startBonusActivationProcedure(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorForbiddenNotAuthorized"
    });
  });

  it("should handle an internal error response", async () => {
    const aGenericProblem = {};
    mockStartBonusActivationProcedure.mockImplementation(() =>
      t.success({ status: 500, value: aGenericProblem })
    );

    const service = new BonusService(api);

    const res = await service.startBonusActivationProcedure(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  // tslint:disable-next-line: no-identical-functions
  it("should return an error for unhandled response status code", async () => {
    mockStartBonusActivationProcedure.mockImplementation(() =>
      t.success({ status: 123 })
    );
    const service = new BonusService(api);

    const res = await service.startBonusActivationProcedure(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });

  it("should return an error if the api call thows", async () => {
    mockStartBonusActivationProcedure.mockImplementation(() => {
      throw new Error();
    });
    const service = new BonusService(api);

    const res = await service.startBonusActivationProcedure(mockedUser);

    expect(res).toMatchObject({
      kind: "IResponseErrorInternal"
    });
  });
});
