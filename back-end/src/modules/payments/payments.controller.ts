import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateTransactionDto, TransactionQueryDto } from './dto/payment.dto';

@ApiTags('Payments & Transactions')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get institutional financial summary & revenue metrics' })
  @ApiResponse({ status: 200, description: 'Returns financial summary and payout metrics' })
  async getSummary() {
    return this.paymentsService.getFinancialSummary();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List all financial transactions with filters, search, and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated transactions' })
  async findAll(@Query() query: TransactionQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get details of a specific transaction' })
  @ApiResponse({ status: 200, description: 'Returns transaction details' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Record a new manual payment, payout, or refund transaction' })
  @ApiResponse({ status: 201, description: 'Transaction recorded successfully' })
  async create(@Body() dto: CreateTransactionDto) {
    return this.paymentsService.create(dto);
  }

  @Get('receipt/:id')
  @ApiOperation({ summary: 'Generate official receipt/invoice statement for a transaction' })
  @ApiResponse({ status: 200, description: 'Returns receipt data' })
  async getReceipt(@Param('id') id: string) {
    return this.paymentsService.getReceipt(id);
  }
}
