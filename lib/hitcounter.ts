import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import {Construct} from 'constructs';

export interface HitCounterProps {
	downstream: lambda.IFunction
}

export class HitCounter extends Construct {
	constructor(scope: Construct, id: string, props: HitCounterProps) {
		super(scope, id);

		// create dynamodb table
		const table = new dynamodb.Table(this, 'Hits', {
			partitionKey: {name: 'path', type: dynamodb.AttributeType.STRING}
		});

		// create lambda
		const hitLambda = new lambda.Function(this, 'HitCounterHandler', {
			runtime: lambda.Runtime.NODEJS_14_X,
			handler: 'hitcounter.handler',
			code: lambda.Code.fromAsset('lambda'),
			environment: {
				DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
				HITS_TABLE_NAME: table.tableName
			}

		})
	}
}