import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import {Construct} from 'constructs';

export interface HitCounterProps {
	downstream: lambda.IFunction
	readCapacity?: number;
}

export class HitCounter extends Construct {
	/** allow accessing the counter function */
	public readonly handler: lambda.Function
	public readonly table: dynamodb.Table

	constructor(scope: Construct, id: string, props: HitCounterProps) {
		if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
			throw new Error('readCapacity must be greater than 5 and less than 20')
		}
		super(scope, id);

		// create dynamodb table
		this.table = new dynamodb.Table(this, 'Hits', {
			partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING},
			//encryption: dynamodb.TableEncryption.AWS_MANAGED
			readCapacity: props.readCapacity ?? 5
		});

		// create lambda
		this.handler = new lambda.Function(this, 'HitCounterHandler', {
			runtime: lambda.Runtime.NODEJS_14_X,
			handler: 'hitcounter.handler',
			code: lambda.Code.fromAsset('lambda'),
			environment: {
				DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
				HITS_TABLE_NAME: this.table.tableName
			}
		})

		// grant write permission to function
		this.table.grantWriteData(this.handler)
		// grant invoke permission to upstream function
		props.downstream.grantInvoke(this.handler)
	}
}