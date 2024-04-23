{-# LANGUAGE DataKinds #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE QuasiQuotes #-}

module Data.GraphQL.Test.Monad.Class where

import Control.Exception (try)
import Control.Monad.IO.Class (MonadIO)
import Control.Monad.Reader (MonadReader, ReaderT, asks, runReaderT)
import Data.Aeson (Value, object, (.=))
import Data.Aeson.Schema (get)
import qualified Data.Aeson.Types as Aeson
import Test.Tasty (TestTree, testGroup)
import Test.Tasty.HUnit (testCase, (@?=))

import Data.GraphQL.Error (GraphQLError (..), GraphQLException (..))
import Data.GraphQL.Monad (MonadGraphQLQuery (..), runQuery)
import Data.GraphQL.Result (GraphQLResult (..))
import Data.GraphQL.Test.TestQuery (TestQuery (..))

newtype MockQueryM a = MockQueryM {unMock :: ReaderT (Either GraphQLError Value) IO a}
  deriving (Functor, Applicative, Monad, MonadIO, MonadReader (Either GraphQLError Value))

runMockQueryM :: Either GraphQLError Value -> MockQueryM a -> IO a
runMockQueryM mockedResult = (`runReaderT` mockedResult) . unMock

instance MonadGraphQLQuery MockQueryM where
  runQuerySafe _ = asks toGraphQLResult
    where
      toGraphQLResult = \case
        Left e -> GraphQLResult [e] Nothing
        Right v -> GraphQLResult [] $ Aeson.parseMaybe Aeson.parseJSON v

testRunQuery :: TestTree
testRunQuery =
  testGroup
    "runQuery <-> runQuerySafe"
    [ testCase "runQuery throws if runQuerySafe returns an error" $ do
        let err = GraphQLError "Something went wrong" Nothing Nothing Nothing
        result <- try $ runMockQueryM (Left err) (runQuery TestQuery)
        show <$> result @?= Left (GraphQLException [err])
    , testCase "runQuery returns the result of runQuerySafe" $ do
        let v = object ["getUser" .= object ["id" .= (1 :: Int)]]
        result <- runMockQueryM (Right v) (runQuery TestQuery)
        [get| result.getUser.id |] @?= 1
    ]
